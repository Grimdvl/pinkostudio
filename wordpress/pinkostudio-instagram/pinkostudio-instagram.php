<?php
/**
 * Plugin Name: Pinko Studio Instagram
 * Description: Read-only, cached Instagram media for the Pinko Studio portfolio slider.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

final class Pinkostudio_Instagram {

	private const DEFAULT_VERSION = 'v25.0';
	private const MAX_PAGES = 10;
	private const PAGE_SIZE = 100;

	public static function register_route() {
		register_rest_route(
			'pinkostudio/v1',
			'/instagram',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'get_post' ),
				// Only explicitly allowed public posts can be returned; no account/token data is exposed.
				'permission_callback' => '__return_true',
				'args'                => array(
					'url' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);
	}

	/** Normalize a permalink without ever requesting the user-supplied URL. */
	private static function canonical_url( $url ) {
		if ( ! is_string( $url ) ) {
			return '';
		}

		$parts = wp_parse_url( trim( $url ) );
		if ( ! is_array( $parts ) || 'https' !== ( $parts['scheme'] ?? '' ) ||
			! in_array( strtolower( $parts['host'] ?? '' ), array( 'instagram.com', 'www.instagram.com' ), true ) ||
			isset( $parts['user'] ) || isset( $parts['pass'] ) || isset( $parts['port'] ) ) {
			return '';
		}

		if ( ! preg_match( '~^/(p|reel|tv)/([A-Za-z0-9_-]+)/?$~D', $parts['path'] ?? '', $match ) ) {
			return '';
		}

		return 'https://www.instagram.com/' . $match[1] . '/' . $match[2] . '/';
	}

	private static function allowed_urls() {
		$urls = apply_filters(
			'pinkostudio_instagram_allowed_urls',
			array(
				'https://www.instagram.com/p/DJ3oIc4NRMg/',
				'https://www.instagram.com/p/DDpBvSJAmzL/',
			)
		);

		return array_values( array_unique( array_filter( array_map( array( __CLASS__, 'canonical_url' ), (array) $urls ) ) ) );
	}

	public static function get_post( WP_REST_Request $request ) {
		$url = self::canonical_url( $request->get_param( 'url' ) );
		if ( ! $url ) {
			return self::error( 'pinko_instagram_invalid_url', 'Потрібне коректне HTTPS-посилання на допис Instagram.', 400 );
		}

		$allowed_urls = self::allowed_urls();
		if ( ! in_array( $url, $allowed_urls, true ) ) {
			return self::error( 'pinko_instagram_url_not_allowed', 'Цей допис не додано до дозволених на сайті.', 403 );
		}

		$token   = defined( 'PINKO_INSTAGRAM_ACCESS_TOKEN' ) ? PINKO_INSTAGRAM_ACCESS_TOKEN : '';
		$user_id = defined( 'PINKO_INSTAGRAM_USER_ID' ) ? PINKO_INSTAGRAM_USER_ID : '';
		$version = defined( 'PINKO_INSTAGRAM_API_VERSION' ) ? PINKO_INSTAGRAM_API_VERSION : self::DEFAULT_VERSION;

		if ( ! is_string( $token ) || '' === trim( $token ) || ! is_scalar( $user_id ) ||
			! preg_match( '/^\d+$/D', (string) $user_id ) || ! is_string( $version ) ||
			! preg_match( '/^v\d+\.\d+$/D', $version ) || preg_match( '/[\r\n]/', $token ) ) {
			return self::error( 'pinko_instagram_not_configured', 'Instagram API ще не налаштовано на сервері.', 503 );
		}

		// Changing credentials/version/allowlist also changes the cache key. Secrets stay on the server.
		$cache_key = 'pinko_ig_' . md5( $version . '|' . $user_id . '|' . $token . '|' . implode( '|', $allowed_urls ) );
		$cached    = get_transient( $cache_key );
		if ( false === $cached ) {
			$cached = self::fetch_posts( (string) $user_id, trim( $token ), $version, $allowed_urls );
			set_transient( $cache_key, $cached, isset( $cached['error'] ) ? MINUTE_IN_SECONDS : HOUR_IN_SECONDS );
		}

		if ( isset( $cached['items'][ $url ] ) ) {
			return rest_ensure_response( $cached['items'][ $url ] );
		}
		if ( isset( $cached['error'] ) ) {
			return self::error( $cached['error']['code'], $cached['error']['message'], $cached['error']['status'] );
		}

		return self::error( 'pinko_instagram_post_not_found', 'Допис не знайдено серед доступних медіа підключеного Instagram-акаунта.', 404 );
	}

	private static function fetch_posts( $user_id, $token, $version, array $allowed_urls ) {
		$items = array();
		$after = '';
		$seen  = array();
		$base  = 'https://graph.instagram.com/' . $version . '/' . $user_id . '/media';
		$fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children.limit(20){id,media_type,media_url,thumbnail_url}';

		for ( $page = 0; $page < self::MAX_PAGES; $page++ ) {
			$query = array( 'fields' => $fields, 'limit' => self::PAGE_SIZE );
			if ( $after ) {
				$query['after'] = $after;
			}

			// Build every request ourselves: never follow an arbitrary permalink or paging.next URL.
			$response = wp_safe_remote_get(
				add_query_arg( $query, $base ),
				array(
					'timeout'             => 8,
					'redirection'         => 0,
					'limit_response_size' => 2 * MB_IN_BYTES,
					'headers'             => array( 'Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json' ),
				)
			);

			if ( is_wp_error( $response ) ) {
				return self::fetch_error( $items );
			}
			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( 200 !== wp_remote_retrieve_response_code( $response ) || ! is_array( $body ) || ! isset( $body['data'] ) || ! is_array( $body['data'] ) ) {
				// Never forward Meta's raw error response: it may contain request/credential details.
				return self::fetch_error( $items );
			}

			foreach ( $body['data'] as $post ) {
				if ( ! is_array( $post ) ) {
					continue;
				}
				$post_url = self::canonical_url( $post['permalink'] ?? '' );
				if ( ! in_array( $post_url, $allowed_urls, true ) ) {
					continue;
				}
				$item = self::normalize_post( $post, $post_url );
				if ( $item ) {
					$items[ $post_url ] = $item;
				}
			}

			if ( count( $items ) === count( $allowed_urls ) ) {
				break;
			}
			$next_after = $body['paging']['cursors']['after'] ?? '';
			if ( empty( $body['paging']['next'] ) || ! is_string( $next_after ) || '' === $next_after || isset( $seen[ $next_after ] ) ) {
				break;
			}
			$after          = $next_after;
			$seen[ $after ] = true;
		}

		return array( 'items' => $items );
	}

	private static function normalize_post( array $post, $url ) {
		$caption = wp_strip_all_tags( (string) ( $post['caption'] ?? '' ) );
		$type    = (string) ( $post['media_type'] ?? '' );
		$media   = array();
		$cover   = '';
		$source  = 'CAROUSEL_ALBUM' === $type ? ( $post['children']['data'] ?? array() ) : array( $post );

		foreach ( (array) $source as $child ) {
			if ( ! is_array( $child ) ) {
				continue;
			}
			$child_type = $child['media_type'] ?? '';
			$media_url  = esc_url_raw( $child['media_url'] ?? '', array( 'https' ) );
			if ( ! in_array( $child_type, array( 'IMAGE', 'VIDEO' ), true ) || ! $media_url ) {
				continue;
			}
			$thumbnail = 'VIDEO' === $child_type ? esc_url_raw( $child['thumbnail_url'] ?? '', array( 'https' ) ) : $media_url;
			if ( ! $cover && $thumbnail ) {
				$cover = $thumbnail;
			}
			$media[] = array(
				'id'   => sanitize_text_field( (string) ( $child['id'] ?? '' ) ),
				'type' => strtolower( $child_type ),
				'url'  => $media_url,
				'alt'  => $caption,
			);
		}

		if ( ! $cover || ! $media ) {
			return null;
		}

		preg_match_all( '/(?<![\p{L}\p{M}\p{N}_])#[\p{L}\p{M}\p{N}_]+/u', $caption, $tags );

		return array(
			'id'        => sanitize_text_field( (string) ( $post['id'] ?? '' ) ),
			'url'       => $url,
			'img'       => $cover,
			'caption'   => $caption,
			'hashtags'  => array_values( array_unique( $tags[0] ?? array() ) ),
			'username'  => sanitize_text_field( (string) ( $post['username'] ?? '' ) ),
			'timestamp' => sanitize_text_field( (string) ( $post['timestamp'] ?? '' ) ),
			'mediaType' => $type,
			'media'     => $media,
		);
	}

	private static function fetch_error( array $items ) {
		return array(
			'items' => $items,
			'error' => array(
				'code'    => 'pinko_instagram_api_unavailable',
				'message' => 'Не вдалося отримати медіа Instagram. Перевірте токен і дозволи в налаштуваннях сервера.',
				'status'  => 502,
			),
		);
	}

	private static function error( $code, $message, $status ) {
		return new WP_Error( $code, $message, array( 'status' => $status ) );
	}
}

add_action( 'rest_api_init', array( 'Pinkostudio_Instagram', 'register_route' ) );
