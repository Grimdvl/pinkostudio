# Pinko Studio — Close Comments

Невеликий плагін для повного закриття стандартних коментарів WordPress і вхідних pingbacks/trackbacks. Пакет підготовлено для встановлення; створення ZIP не встановлює і не активує плагін на сайті.

## Що робить

Плагін містить лише три фільтри:

- `comments_open` → `false`;
- `pings_open` → `false`;
- `get_default_comment_status` → `closed`.

Обмеження діють на старі й нові записи, сторінки, вкладення медіатеки та інші типи записів. Стандартні перевірки WordPress закривають надсилання через `wp-comments-post.php`, REST API коментарів, XML-RPC і trackbacks. Налаштування нового вкладення не може відкрити його для стандартних коментарів, поки плагін активний.

Плагін не переписує збережені `comment_status`/`ping_status`. Тому редактор або REST-відповідь можуть показувати старе значення `open`, хоча `comments_open()`/`pings_open()` повертають `false` і стандартне надсилання заблоковано.

## Дані та сумісність

Поточні коментарі залишаються в базі: плагін їх не видаляє, не змінює і не приховує. Він не змінює структуру чи підтримку custom post types, не блокує REST API цілком і не додає фільтрів до низькорівневого `wp_insert_comment()`. Маршрути ACF, форм і бронювань та внутрішні нотатки плагінів не перехоплюються.

## Встановлення й відкат

1. У WordPress відкрийте **Плагіни → Додати плагін → Завантажити плагін**.
2. Виберіть `pinkostudio-close-comments.zip`, встановіть і активуйте його.
3. Для відкату деактивуйте плагін. Його фільтри одразу перестануть діяти; збережені дані та налаштування залишаться без змін. Матеріали, які вже закрито через адмінку, залишаться закритими.

## Перевірка

На сервері з PHP можна перевірити синтаксис:

```sh
php -l wp-content/plugins/pinkostudio-close-comments/pinkostudio-close-comments.php
```

Після активації стандартні коментарі та пінги мають бути закритими також для вкладення медіатеки, а кількість наявних коментарів — незмінною. Перевірте роботу форми запису й календаря на вашому сайті.

Офіційні джерела: [comments_open](https://developer.wordpress.org/reference/hooks/comments_open/), [pings_open](https://developer.wordpress.org/reference/hooks/pings_open/), [get_default_comment_status](https://developer.wordpress.org/reference/hooks/get_default_comment_status/), [перевірка REST-коментарів](https://developer.wordpress.org/reference/classes/wp_rest_comments_controller/create_item_permissions_check/).
