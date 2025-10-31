from __future__ import annotations

import random


# シンプルなテンプレ + パーツ合成（外部API不要）
TITLES = {
    "horror": [
        "闇夜のカボチャ村",
        "囁くランタン",
        "墓地の向こう側",
        "月下に揺れる影",
    ],
    "gag": [
        "転びそうなドラキュラ",
        "お化けの残業",
        "カボチャの出世物語",
    ],
    "kids": [
        "やさしいゴーストのピポ",
        "キャンディと小さな勇者",
        "おやすみハロウィン",
    ],
}

OPENERS = {
    "horror": [
        "風が止むと、古い家のドアがきしんだ。",
        "時計が零時を告げるころ、村はしんと静まり返った。",
    ],
    "gag": [
        "カボチャが転んだ拍子に、種が名刺みたいに飛んでいった。",
        "ドラキュラは禁コーヒー中。なのに今日に限って無料試飲。",
    ],
    "kids": [
        "ピポはやさしいおばけ。いたずらは苦手なんだ。",
        "きょうはハロウィン。みんなで“トリック・オア・トリート”。",
    ],
}

EVENTS = {
    "horror": [
        "遠くでランタンが一つ、また一つと灯り、誰もいないはずの道を導く。",
        "足元の影が遅れてついてくる。やがて、それは笑った。",
        "家の地下から、湿った息遣いが聞こえた。",
    ],
    "gag": [
        "ゾンビたちはダンス練習中。リズム感は壊滅的。",
        "魔女のホウキがBluetooth接続を要求してきた。",
        "ドラキュラのマント、実は福袋の外装だった。",
    ],
    "kids": [
        "ピポは小さなランタンで道を照らした。",
        "カボチャの馬車が、ふわりと空に浮かんだよ。",
        "困っている黒猫を、みんなで助けたんだ。",
    ],
}

ENDINGS = {
    "horror": [
        "背後を振り返ると、ランタンだけが残っていた。",
        "朝日が昇るころ、影はやっと足元に戻った。",
    ],
    "gag": [
        "最後はみんなで記念撮影。もちろんピースサインで。",
        "会計はポイントで。ゾンビもキャッシュレス。",
    ],
    "kids": [
        "みんなで“ハッピーハロウィン！”と笑った。",
        "おやすみなさい、また来年も会おうね。",
    ],
}


def generate_story(mode: str, hero: str, length: str, seed: int | None = None):
    rng = random.Random(seed)
    title = rng.choice(TITLES[mode])

    opener = rng.choice(OPENERS[mode]).replace("{hero}", hero)

    n_events = 2 if length == "short" else 3
    events = rng.sample(EVENTS[mode], k=n_events)

    ending = rng.choice(ENDINGS[mode])

    story = "\n".join([opener] + events + [ending])
    story = story.replace("{hero}", hero)
    return title, story
