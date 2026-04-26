// npm install lucide-react recharts firebase

import React, { useState, useEffect } from 'react';
import { Check, X, Home, ChevronRight, LogOut, List, PieChart, BookOpen, AlertCircle, Play, RotateCcw } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// -----------------------------------------------------------------------------
// Firebase Configuration & Initialization
// ※ 必ず環境変数 (import.meta.env) 経由で設定してください
// -----------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// アプリごとの固有保存領域名
const APP_ID = "QuizApp_001_DesignTrademark";

// -----------------------------------------------------------------------------
// Quiz Data (全16問 完全収録)
// -----------------------------------------------------------------------------
const quizData = [
  {
    id: 1,
    title: "問題 1 意匠権：定義・要件",
    question: "意匠法に関する次の文中の空欄Ａ～Ｃに入る語句の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\n意匠法では、意匠は「物品の形状、模様もしくは色彩またはこれらの結合、　Ａ　の形状等または画像であって、視覚を通じて美感を起こさせるもの」と定義されている。\n意匠登録の要件としては、「　Ｂ　利用できる」、「　Ｃ　がある」、「創作非容易性がある」、「先願である」、「不登録事由に該当しない」などがある。",
    options: [
      "Ａ：建築物　 Ｂ：工業上 　Ｃ：新規性",
      "Ａ：建築物 　Ｂ：産業上　 Ｃ：進歩性",
      "Ａ：自然物　 Ｂ：工業上　 Ｃ：進歩性",
      "Ａ：自然物 　Ｂ：産業上　 Ｃ：進歩性"
    ],
    answer: 0,
    explanation: "Ａ～Ｃに入る語句は以下になります。よって正解はアになります。\n\n【Ａ：建築物】\n建築物の形状等または画像で視覚を通じて美感を起こさせるものは、意匠として認められます。\n\n【Ｂ：工業上】\n特許法における発明や実用新案法における考案が登録されるためには、「産業上利用できる」という要件がありますが、意匠法では「工業上利用できる」という要件になっています。これは、意匠が工業製品を対象にしていることを表しています。\n\n【Ｃ：新規性】\n新規性があるとは、特許法と同じように、出願前に公に知られていないということを表します。特許法には「進歩性がある」という要件もありますが、意匠法では「創作非容易性がある」という要件となっています。意匠はデザインに関するものであるため、創作非容易性と表されています。誰もが簡単に思いつくようなデザインは、創作性が高いとは言えず、意匠登録をすることはできません。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では意匠の定義や意匠登録の要件について問われています。",
      rows: [
        "意匠法では、意匠は、 物品の形状、模様もしくは色彩またはこれらの結合、建築物の形状等または画像であって、視覚を通じて美感を起こさせるもの と定義されています。これらの定義は、令和2年4月1日施行の改正意匠法によって改正されましたが、改正により従来は保護されなかった建築物の外観や内装デザインが、保護されるようになりました。",
        "意匠登録の要件としては、「 工業上利用できる 」「 新規性がある 」「 創作非容易性がある 」「 先願である 」「 不登録事由に該当しない 」などがあります。公序良俗に反することなどが不登録事由に挙げられます。",
        "意匠の定義や意匠登録の要件について理解しておきましょう。"
      ]
    }
  },
  {
    id: 2,
    title: "問題 2 意匠権：登録要件1",
    question: "意匠登録の要件に関する説明として、最も適切なものはどれか。",
    options: [
      "意匠は、感覚に訴えるものであれば登録の可能性があり、例えば香水や食品の香料など香りの意匠も登録できる。",
      "他人の意匠と同一でなければ、類似する意匠であっても登録の対象となる。",
      "１点ものの芸術作品の意匠は、意匠登録を受けることができない。",
      "その機能を確保するために不可欠な形状のみによる意匠も登録の対象となる。"
    ],
    answer: 2,
    explanation: "ア ×：意匠登録を受けることができる意匠は、視覚を通じて美感を起こさせるものである必要があります。そのため、香りのように目に見えないものは意匠登録されることはありません。\n\nイ ×：他人の意匠に類似する意匠は登録できないことになっています。意匠権の効力は類似する意匠にまで及ぶためです。\n\nウ ○：適切な記述です。意匠登録を受けるには、工業上利用できる意匠である必要があります。そのため、工業的に反復して量産できる必要があり、一点ものの芸術作品、例えば絵画や彫刻といった純粋美術は意匠登録の対象とはなりません。\n\nエ ×：意匠権は美感を起こさせるデザインを保護するものなので、製品の機能を確保するためだけの形状は意匠登録することはできません。例えば、JIS で定められたコンセントの形状などを、そのまま意匠登録することはできません。\n\nよって、選択肢ウが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、意匠登録の要件について問われています。",
      rows: [
        "意匠登録を受けるためには、その対象が意匠法上の意匠である必要があります。そのうえで工業上利用可能であり、新規性や創作非容易性があることが求められます。また、意匠登録出願が先願であることも必要です。ここまでの要件は特許法とほぼ同様です。さらに、不登録事由として、公序良俗違反や他人の業務に係る物品、建築物または画像との混同のおそれなどが挙げられます。",
        "意匠登録の要件について理解しておきましょう。"
      ]
    }
  },
  {
    id: 3,
    title: "問題 3 意匠権：登録要件2",
    question: "意匠登録の要件に関する説明として、最も適切なものはどれか。",
    options: [
      "「乗用自動車」の意匠が公然と知られている場合に、その意匠に類似する意匠について意匠登録出願したときは、その出願は新規性がないとして拒絶される。",
      "｢乗用自動車｣の意匠が公然と知られている場合に、その意匠が公然と知られるようになったのと同じ日にその意匠について意匠登録出願すれば、その出願は新規性がないとして拒絶されない。",
      "「乗用自動車」の意匠が公然と知られている場合に、その乗用自動車と形状の類似する｢自動車おもちゃ｣について意匠登録出願したときは、その出願は新規性がないとして拒絶される。",
      "｢乗用自動車｣の意匠が公然と知られている場合に、意匠登録を受ける権利を有する者の行為により公然と知られるようになったものであったとしても、その後その意匠について意匠登録出願をしても、その出願は新規性がないものとして拒絶される。"
    ],
    answer: 0,
    explanation: "ア ○：新規性の判断は公知の意匠に類似する意匠にまで及びます。したがって、公知の「乗用自動車」の意匠に類似する意匠については新規性がありません。\n\nイ ×：新規性の判断時期については、公知となった時点と意匠登録出願の時点を比較して行います。この比較は日だけでなく時分まで考慮するため、たとえ同じ日であっても午前中に公知になった意匠について、午後に意匠登録出願がされた場合などには新規性がないとされます。\n\nウ ×：「乗用自動車」と「自動車おもちゃ」は物品が類似しません。そのため意匠として非類似となり、たとえ形状が類似していても新規性はあるとされます。なお、この場合であっても「形態」が類似するため創作性がないとされる可能性はあります。\n\nエ ×：新規性のない意匠であっても新規性喪失の例外規定が適用される可能性があります。その要件は、意匠登録を受ける権利を有する者の行為に起因する公知か、その者の意に反する公知で、公表日から1年以内に例外規定の適用を受けたい旨の書面などを出願と同時に提出し、かつ30日以内に公表などの事実を証明する書面を提出することです。したがって、本肢の場合は新規性を失っていないものとして扱われる余地があります。\n\nよって、選択肢アが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では意匠登録の要件、特に新規性と創作性について問われています。",
      rows: [
        "意匠法は意匠の創作を奨励するため、その登録を受けるための要件として、 新規性 と 創作性 を要求しています。簡単に言えば、新規性とは「まだ知られていないものであること」、創作性とは「 簡単に創作できるものではないこと 」といえます。",
        "新規性の判断は一定の「意匠」についてなされます。公然知られた意匠や刊行物に記載された意匠と同一・類似の意匠については、新規性がありません。",
        "一方、創作性の判断は「形態」（＝形状、模様、色彩またはこれらの結合）についてなされます。公知の形態に基づいて容易に創作できる意匠については、創作性がありません。「意匠」ではなく「形態」であることの意味は、「物品、建築物または画像」が異なってもよいという点にあります。",
        "新規性と創作性の判断をどのように行うのかを、類似の観点と合わせて理解しておきましょう。"
      ]
    }
  },
  {
    id: 4,
    title: "問題 4 意匠権：取得手続き",
    question: "意匠権の取得手続きに関する説明として、最も適切なものはどれか。",
    options: [
      "意匠登録出願には、願書、意匠登録請求の範囲、図面を提出する。",
      "意匠権の取得において、方式審査を通過した後に、審査請求を行うことにより、実体審査が行われる。",
      "意匠権の取得において、出願時に登録料を納める必要がある。",
      "意匠登録出願が登録査定となった場合は、出願人に登録査定謄本が送られてくる。"
    ],
    answer: 3,
    explanation: "ア ×：特許出願では、「特許請求の範囲」を提出し、実用新案登録出願では、「実用新案登録請求の範囲」を提出しますが、意匠登録出願には、これらに該当する書面はなく、提出書類は願書と図面のみです。\n\nイ ×：特許出願の場合は、方式審査の後、実体審査に進むには、審査請求が必要ですが、意匠登録出願の場合は、審査請求は必要ありません。方式審査を通過すると自動的に実体審査が行われます。\n\nウ ×：意匠権の登録料は、実体審査の結果、登録査定となった後に納付します。初回の登録料は第1年分のみです。\n\nエ ○：正しい記述です。登録査定謄本が送られた後、登録料を納付することで意匠権の設定登録が行われ、意匠公報に掲載されて公表されます。\n\nよって、選択肢エが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、意匠権の取得手続きについて問われています。",
      rows: [
        "意匠権を取得するためには、最初に出願を行います。意匠登録出願では、願書や図面を提出します。",
        "出願すると、方式審査と実体審査が行われます。方式審査では、出願書類が決められた形式を満たしているかを審査します。実体審査では、出願された意匠が登録要件を満たしているかを審査します。登録要件を満たしている場合には登録査定、登録要件を満たしていない場合には拒絶査定となります。",
        "登録査定となった場合は、出願人に登録査定謄本が送られてきます。その後、登録料を納付することで意匠権の設定登録が行われ、意匠公報に掲載されて公表されます。",
        "登録要件を満たさない場合は、まず出願人に「拒絶理由通知書」が送られてきます。この場合、意見書を提出して拒絶理由に反論することができます。意見書でも拒絶理由が解消されない場合は、拒絶査定となります。拒絶査定に反論する場合は、「拒絶査定不服審判」を請求できます。さらに、審判でも拒絶審決となった場合は、「審決取消訴訟」を提起することができます。"
      ]
    }
  },
  {
    id: 5,
    title: "問題 5 意匠権：効力と活用",
    question: "意匠権の効力および活用に関する説明として、最も不適切なものはどれか。",
    options: [
      "意匠権者の許諾を受けていない第三者が作成したその意匠と類似の画像は、意匠権の侵害とならない。",
      "意匠権者の許諾を受けていない第三者が、試験研究のためにその意匠権者の有する登録意匠を実施した場合は、意匠権の侵害とはならない。",
      "意匠権者の許諾を受けていない第三者がその意匠に係る画像を電気通信回線により提供することは、意匠権の侵害となる。",
      "意匠権者の許諾を受けていない第三者がその意匠に係る画像を記録した記録媒体を譲渡することは、意匠権の侵害となる。"
    ],
    answer: 0,
    explanation: "ア ×：意匠権では、許諾を受けていない第三者が、類似するデザインを実施した場合も、意匠権の侵害となります。よって、最も不適切な記述です。\n\nイ ○：正しい記述です。特許権と同じように、意匠権においても、試験研究のための実施の場合は、権利の侵害とはなりません。\n\nウ ○：正しい記述です。意匠権者の許諾を受けていない第三者がその意匠に係る画像を電気通信回線により提供することやその申出をすることは、意匠権の侵害となります。\n\nエ ○：正しい記述です。意匠権者の許諾を受けていない第三者がその意匠に係る画像を記録した記録媒体や内蔵する機器を譲渡、貸渡し、輸出入する行為、またそれらの申出をする行為は、意匠権の侵害となります。\n\nよって、選択肢アが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、意匠権の効力および活用について問われています。",
      rows: [
        "意匠法には、「意匠権者は、業として登録意匠及びこれに類似する意匠の実施をする権利を専有する」と記載されています。実施という行為には、対象となる意匠に係る物品を生産、使用、譲渡、輸出、輸入することなどが含まれます。さらに、意匠権の場合は、 同じ意匠だけでなく、類似する意匠にも効力が及びます。",
        "また、意匠権の存続期間は、出願日から25年となっています。",
        "意匠権の効力や活用方法について理解しておきましょう。"
      ]
    }
  },
  {
    id: 6,
    title: "問題 6 意匠権：特徴1",
    question: "意匠法の制度に関する説明として、最も不適切なものはどれか。",
    options: [
      "部分意匠の意匠権の効力は、その意匠と同一・類似の部分を含む全体意匠にまでは及ばない。",
      "先に全体意匠を出願していた場合、全体意匠の意匠公報の発行日の前日までであれば、部分意匠を出願することが可能である。",
      "組物意匠として意匠登録をした場合、組物の構成物ごとの模倣品に対して権利を行使することはできない。",
      "組物意匠として登録できる物品は、経済産業省令により指定されている。"
    ],
    answer: 0,
    explanation: "ア ×：部分意匠の意匠権の効力は、その意匠と同一・類似の部分を含む全体意匠にまで及びます。よって、最も不適切な記述です。\n\nイ 〇：正しい記述です。部分意匠の出願は、全体意匠の意匠公報の発行日の前日まで認められます。\n\nウ 〇：正しい記述です。組物意匠として登録した場合、組物全体として意匠権が発生するため、構成物品ごとの模倣に対しては権利を行使することができません。そのため、構成物品ごとに保護したい場合には、個々の物品ごとに意匠登録を行います。\n\nエ 〇：正しい記述です。組物意匠として登録できる物品は、経済産業省令により指定されています。具体的には、コーヒーセットやテーブルセット、オーディオ機器セットなどです。\n\nよって、選択肢アが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、意匠法の制度について問われています。",
      rows: [
        "意匠法には次のような制度があります。",
        "● 部分意匠制度\n物品、建築物または画像の一部分についての意匠を登録できる制度です。",
        "● 組物意匠制度\n複数の物品、建築物または画像をセットにして組物意匠として登録できる制度です。"
      ]
    }
  },
  {
    id: 7,
    title: "問題 7 意匠権：特徴2",
    question: "意匠法の制度に関する説明として、最も適切なものはどれか。",
    options: [
      "関連意匠は、本意匠に類似せず関連意匠にのみ類似する意匠については登録することができない。",
      "関連意匠の存続期間は、関連意匠の登録日から25年となっている。",
      "秘密意匠制度を利用すると、登録日から3年間は、意匠を公開せずに秘密にしておくことができる。",
      "意匠の出願時に秘密意匠とする請求をしなければ、出願後に秘密意匠とすることはできない。"
    ],
    answer: 2,
    explanation: "ア ×：関連意匠は、本意匠に類似する意匠だけではなく、本意匠に類似せず関連意匠にのみ類似する意匠についても登録することができます。\n\nイ ×：関連意匠の存続期間は、本意匠の出願日から25年です。存続期間が出願日から25年というのは原則どおりですが、関連意匠の場合、本意匠の出願日から数えることに注意しましょう。\n\nウ ○：正しい記述です。秘密意匠制度は、登録日から最大3年間、意匠を公開せずに秘密にしておくことのできる制度です。登録日から数えることに注意しましょう。\n\nエ ×：秘密意匠とする請求は、出願時の他に、登録料を納付する際にもすることができます。\n\nよって、選択肢ウが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、意匠法の特殊制度について問われています。",
      rows: [
        "意匠法には、部分意匠制度や組物意匠制度以外に、次のような制度があります。",
        "●関連意匠制度\nある意匠に類似する意匠も合わせて登録できる制度です。",
        "●秘密意匠制度\n登録日から最大3年間、意匠を公開せずに秘密にしておくことのできる制度です。",
        "上記2つの制度については理解しておきましょう。"
      ]
    }
  },
  {
    id: 8,
    title: "問題 8 商標権：定義・要件",
    question: "商標権に関する説明として、最も適切なものはどれか。",
    options: [
      "自動二輪車の形状は商品そのものの形状なので、立体商標として登録されることはない。",
      "テレビのＣＭで使用されるサウンドロゴを商標として登録することができる。",
      "商標登録出願では、目に見える商品を指定することはできるが、目に見えない役務を指定することはできない。",
      "人物の人形や銅像は、商標として登録されることはない。"
    ],
    answer: 1,
    explanation: "ア ×：自動二輪車の立体的形状が、他の商品との識別性があり、商品そのものの不可欠な形状ではないと認められれば、立体商標として登録できる場合があります。自動二輪車の立体商標の事例としては、「スーパーカブ」があります。\n\nイ ○：正しい記述です。商品の宣伝はイラストや文字など目で見る方法を使ったものが多いのですが、会社や商品の名前をメロディにのせたサウンドロゴとするものもあり、音商標として登録することができます。\n\nウ ×：商標の定義としては、「業として役務を提供し、または証明する者がその役務について使用するもの」ことが挙げられており、商品だけでなく役務（サービス）について商標登録をすることが可能です。\n\nエ ×：立体的な形状であって唯一無二な形状から、「識別力」があるものとして商標登録が認められた大学の創始者の銅像の例があります。同様に立体商標として認められたものは他にも存在し、ケンタッキーフライドチキンの「カーネル・サンダース像」や不二家の「ペコちゃん像」などがあてはまります。\n\nよって、選択肢イが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、商標の定義や商標の分類について問われています。",
      rows: [
        "商標法には、商標は「人の知覚によって認識することができるもののうち、文字、図形、記号、立体的形状若しくは色彩又はこれらの結合、音その他政令で定めるもの」とあります。",
        "さらに商標は、業として商品を生産し、証明し、または譲渡する者がその商品について使用するもの、業として役務を提供し、または証明する者がその役務について使用するものとなっています。",
        "商標は「文字商標」「図形商標」「記号商標」「立体商標」「色彩商標」「音商標」「動き商標」「位置商標」などの種類に分けられます。商標登録の分類は整理して理解しておきましょう。"
      ]
    }
  },
  {
    id: 9,
    title: "問題 9 商標権：地域団体商標制度",
    question: "地域団体商標制度に関する記述として最も適切なものはどれか。",
    options: [
      "地域団体商標に係る商標権には、専用使用権を設定できる。",
      "地域団体商標に係る商標権には、全国的な知名度が必要である。",
      "地域団体商標の団体の構成員も、当該商標を使用することができる。",
      "商工会・商工会議は地域団体商標の出願をすることができない。"
    ],
    answer: 2,
    explanation: "ア ×：地域団体商標の商標権には専用使用権の設定はできません。これは、商標権者以外の者に専用使用権を設定すると、商標権者がその商標を使えなくなってしまうためです。\n\nイ ×：地域団体商標では、全国的な知名度は必要ありません。隣接する都道府県程度に及ぶ周知性があればよいことになっています。\n\nウ 〇：正しい記述です。地域団体商標の登録は団体名義で行われますが、団体の構成員も当該商標を使用することができます。\n\nエ ×：地域団体商標を出願できるのは、事業協同組合や農業協同組合などの法人格を有する組合、商工会、商工会議所、NPO法人です。なお、株式会社、社団法人などは出願することができません。\n\nよって、選択肢ウが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、地域団体商標制度について問われています。",
      rows: [
        "地域団体商標制度は、地域名に商品の普通名称を組み合わせた商標を登録できる制度です。例えば、「松阪牛」のような地域名と普通名称を組み合わせた名称を、地域団体商標制度によって商標登録できます。",
        "地域団体商標の目的は、地域ブランドを育成することです。従来は、このような「地名＋商品の普通名称」という名称は、全国的に著名にならないと商標登録ができませんでしたが、平成18年から地域団体商標制度が施行され、商標登録ができるようになりました。"
      ]
    }
  },
  {
    id: 10,
    title: "問題 10 商標権：取得手続き",
    question: "商標権の取得手続きに関する説明として、最も適切なものはどれか。",
    options: [
      "商標法では、出願公開制度があり、出願から1年6月経過すると、商標公報に掲載される。",
      "商標登録出願において、商品や役務を指定するが、1つの商標登録出願で複数の区分に属する商品や役務を指定することはできない。",
      "商標登録出願の審査では、方式審査と実体審査が行われるが、方式審査後に審査請求を行う必要がある。",
      "商標登録がされた後に、その商標権を無効と主張する商標登録無効審判や登録異議申立てという制度がある。"
    ],
    answer: 3,
    explanation: "ア ×：商標法では、出願公開制度がありますが、出願から1年6月経過後ではなく、出願があったときに商標公報に掲載されます。商標の使用は容易であり、同一・類似の商標使用を未然に防ぐために、早期に公開を行っています。\n\nイ ×：商標登録出願では、その商標をどのような商品や役務に使用するかを指定する必要があります。商品や役務はその特徴により複数の区分（グループ）に分けられており、願書には区分ごとに商品や役務を記載します。指定する商品や役務が複数の区分にまたがる場合には、1つの商標登録出願で複数の区分を記載することも可能です。例えば、1つの商標登録出願で、家具と電気機器を同時に指定することもできます。\n\nウ ×：商標登録出願の審査では、方式審査と実体審査が行われますが、審査請求は必要なく、方式審査を通過すると自動的に実体審査が行われます。これは意匠法と同様です。\n\nエ ○：正しい記述です。商標登録無効審判は、商標登録されるべきでない商標が商標登録されているような場合に、特許庁へ審判を請求することにより、商標登録を無効にすることができる制度です。利害関係人が、原則としていつでも請求可能です。また同様の制度として登録異議申立てがあります。登録異議申立ては、商標公報の発行後2ヶ月以内に限り、誰でも商標登録の取消しを求めることができる制度です。\n\nよって、選択肢エが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、商標権の取得手続きについて問われています。",
      rows: [
        "商標権を取得するためには、最初に出願を行います。商標登録出願では、願書や必要な書面を提出します。願書には、出願人の名前や住所、商標登録する商標、指定商品・指定役務とその区分を記入します。",
        "商標法では、出願すると出願公開が行われます。出願した商標の内容が、「商標公報」に掲載され公開されます。",
        "次に、方式審査と実体審査が行われます。実体審査が終了すると、登録要件を満たしている場合には登録査定、登録要件を満たしていない場合には拒絶査定となります。",
        "登録要件を満たさない場合は、まず出願人に「拒絶理由通知書」が送られてきます。この場合、意見書を提出して拒絶理由に反論することができます。意見書でも拒絶理由が解消されない場合は、拒絶査定となります。さらに、その後、意匠法などと同様に、拒絶査定不服審判や審決取消訴訟といった対応方法があります。"
      ]
    }
  },
  {
    id: 11,
    title: "問題 11 商標権：効力",
    question: "商標権の効力に関する説明として、最も不適切なものはどれか。",
    options: [
      "商標を付けた物を利用して役務を提供する行為は、商標の使用にあたる。",
      "商標を付した商品を輸出する行為は、商標の使用にあたる。",
      "ピアノについて登録した商標に関して、第三者が時計に類似する商標を使用した場合、商標権者は商標の使用の禁止を求めることができる。",
      "商標権に係る指定商品・役務が複数あるときは、指定商品・役務ごとに分割して移転することができる。"
    ],
    answer: 2,
    explanation: "ア ○：商標を付けた物を利用して役務を提供する行為は、商標の使用にあたります。レストランで食事を提供する皿などにレストランの登録商標を付ける行為は商標の使用です。よって、正しい記述です。\n\nイ ○：商標の使用には、商標が付いた商品を輸出、輸入することを含みます。よって、正しい記述です。\n\nウ ×：商標権の禁止権は、類似する商標や類似する商品まで効力が及びますが、類似していない商品に対しては効力が及びません。ピアノと時計は類似する商品ではありませんので、第三者が類似する商標を使用しても、禁止権の効力は及ばず、使用の禁止を求めることはできません。よって、最も不適切な記述です。\n\nエ ○：正しい記述です。商標権に係る指定商品・役務が複数あるときは、指定商品・役務ごとに分割して移転することができます。\n\nよって、選択肢ウが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、商標権の効力について問われています。",
      rows: [
        "商標法には、「商標権者は、指定商品又は指定役務について登録商標の使用をする権利を専有する」と記載されています。",
        "したがって、商標権者には指定商品･役務について同一の商標を使用する権利があります。これを専用権と呼びます。また、登録商標と類似する商標を他人が使うことを禁止する権利もあります。これを禁止権と呼びます。",
        "商標権の存続期間は、登録日から10年となっています。ただし、更新登録をすることで、何度でも更新をすることができます。"
      ]
    }
  },
  {
    id: 12,
    title: "問題 12 商標権：移転",
    question: "商標権の移転に関する説明として、最も適切なものはどれか。",
    options: [
      "商標権が共有に係るときは、各共有者は他の共有者の同意を得なくても、その持分を譲渡することができる。",
      "2以上の指定商品・指定役務を指定する商標権は、指定商品・指定役務ごとに分割して移転することができる。",
      "団体商標に係る商標権は、一般社団法人や事業協同組合に移転することができるが、株式会社に移転することはできない。",
      "地域団体商標に係る商標権は事業協同組合に譲渡することができるが、株式会社に譲渡することはできない。"
    ],
    answer: 1,
    explanation: "ア ×：商標権が共有に係るときは、その持分を譲渡するには他の共有者の同意が必要です。この点は特許法や意匠法と同様の取り扱いとなっています。\n\nイ ○：2以上の指定商品・指定役務を指定する商標権は、指定商品・指定役務ごとに分割して移転することで、指定商品や指定役務の一部のみを移転することができます。たとえば、ある商標について自動車と自動車整備の2つを指定して登録がされているときに、自動車についての権利のみを移転することができます。\n\nウ ×：団体商標に係る商標権は、一般社団法人や事業協同組合だけでなく、株式会社に移転することもできます。ただし、株式会社に移転した場合は、通常の商標権に変更されたものとみなされます。\n\nエ ×：地域団体商標に係る商標権は譲渡することができません。これは地域団体商標制度の目的が地域ブランドの育成であるため、商標権者以外の者に譲渡するのが不適切であるためです。\n\nよって、選択肢イが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では商標権の移転について問われています。",
      rows: [
        "商標権も財産権ですので、原則として自由に移転することができます。しかし、一部に例外があり、移転が制限される場合があります。",
        "●通常の商標権\n自由に譲渡することができます。指定商品・指定役務が２以上あるときは、指定商品・指定役務ごとに商標権を分割することができ、分割したうえでそれぞれの商標権を移転することも可能です。ただし、商標権が共有に係るときは、その持分を譲渡するには他の共有者の同意が必要です。",
        "●団体商標に係る商標権\n自由に移転することができます。ただし、団体商標に係る商標権を団体商標に係る商標権として移転する場合は、その相手方は一般社団法人や事業協同組合など団体商標の商標登録を受けられるものに限られます。それ以外の者に移転する場合は、通常の商標権に変更されたものとみなされます。",
        "●地域団体商標に係る商標権\n地域団体商標に係る商標権は譲渡することができません。"
      ]
    }
  },
  {
    id: 13,
    title: "問題 13 商標権：特殊な商標権",
    question: "商標権に関する次の文中の空欄Ａ～Bに入る語句の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\n著名になった商標を保護するための制度を　Ａ　と言う。登録を行うことで、類似しない商品･役務まで禁止権が及ぶようになります。登録が認められるためには、基になる商標が既に登録されており、　Ｂ　に及ぶ周知性が必要である。",
    options: [
      "Ａ：防護標章登録制度　　Ｂ：隣接する都道府県程度",
      "Ａ：防護標章登録制度　　Ｂ：全国",
      "Ａ：団体商標登録制度　　Ｂ：隣接する都道府県程度",
      "Ａ：団体商標登録制度　　Ｂ：全国"
    ],
    answer: 1,
    explanation: "Ａ～Ｂに入る語句は以下になります。\n\n【Ａ：防護標章登録制度】\n\n【Ｂ：全国】\n防護標章登録を行うには、基になる商標が既に登録されており、かつ全国的に著名になっている必要があります。防護標章の登録を行うには、特許庁に「防護標章登録願」を提出し、審査を受ける必要があります。\n\n上記より、適切な選択肢はイとなります。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では防護標章登録制度について問われています。ここで記載されている２つの登録制度は下記になります。",
      rows: [
        "● 防護標章登録制度\n防護標章登録制度は、特に著名になった商標を保護するための制度です。著名というのは、全国的に広く知れ渡っていることを表します。登録商標が広く需要者に認識されたことにより、その商標を他人が指定商品または役務以外に使用することで商品や役務の出所の混同を生じさせる恐れがある場合、その商標の無断使用を禁止する制度です。防護標章登録を行うと、指定商品･役務に類似していない場合まで禁止権が及ぶようになります。",
        "● 団体商標登録制度\n社団法人や事業共同組合などの団体で、商標を登録できる制度です。団体商標を登録すると、団体を構成する構成員が、許諾を受けなくても団体商標を使用できるようになります。"
      ]
    }
  },
  {
    id: 14,
    title: "問題 14 商標権：小売等役務商標制度",
    question: "小売等役務商標制度に関する説明として、最も不適切なものはどれか。",
    options: [
      "小売等役務商標制度は、小売業等を対象とした制度であり、卸売業は対象とならない。",
      "他者が小売等役務商標の登録を受けた場合でも、平成19年4月1日よりも前から使用してきた商標であれば、従来の業務範囲内で商標を使い続けることができる。",
      "「三河屋」というようなありふれた店名については、多くの事業者が使用している可能性があるため、商標登録を受けることは難しい。",
      "小売店が小売等役務商標を登録すれば、店の看板や従業員の制服などに登録商標を付すことも登録商標の使用として商標法の保護を受けることができる。"
    ],
    answer: 0,
    explanation: "ア ×：小売等役務商標制度では、小売業者だけではなく、卸売業者が行っているサービス活動（役務）も対象となっています。よって、最も不適切な記述です。\n\nイ ○：正しい記述です。他者が小売等役務商標の登録を受けた場合でも、小売等役務商標制度が導入される前から使用してきた商標であれば、従来の業務範囲内で商標を使い続けることができます。\n\nウ ○：多くの事業者が使用しているありふれた店名については、商標登録を行うことは困難であるとされています。\n\nエ ○：まさしく小売等役務商標制度の利点について記述されています。小売等役務商標制度が導入される前は、個々の商品カテゴリを指定して商標登録をしている場合でも、店の看板やレジ袋などに店の名前を使用することは、商標法による保護の対象にはなっていませんでした。小売等役務商標制度の導入によって、これらにも商標法の保護が及ぶようになりました。\n\nよって、選択肢アが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では、小売等役務商標制度について問われています。",
      rows: [
        "従来は、小売業者や卸売業者が行っているサービス活動（役務）については、商標の保護の対象になっていませんでした。そのため、小売店の名前（屋号）を商標法で保護しようとした場合でも、店の名前について、様々な商品カテゴリ（例：加工食品、飲料、衣服、等々）を指定して、個々に商標登録する必要がありました。",
        "それが、平成19年4月1日施行の商標法の改正により、小売等役務商標制度が導入され、小売業者や卸売業者が行っているサービス活動全般（役務）を指定した商標登録ができるようになりました。",
        "小売等役務商標を登録すれば、店の看板、レジ袋、ショッピングカート、従業員の制服などに登録商標を付すことも、登録商標の使用として商標法の保護を受けることができるようになります。"
      ]
    }
  },
  {
    id: 15,
    title: "問題 15 商標権：不使用取消審判",
    question: "不使用取消審判に関する説明として、最も適切なものはどれか。",
    options: [
      "商標権者が指定商品・指定役務について登録商標に類似する商標の使用をしていれば、不使用取消審判によって商標登録が取り消されることはない。",
      "商標権者、専用使用権者、通常使用権者のいずれかが、指定商品・指定役務についての登録商標の使用をしていれば、不使用取消審判によって商標登録が取り消されることはない。",
      "不使用取消審判では、審判請求人が指定商品や指定役務について登録商標の使用をしていないことを証明しなければならない。",
      "不使用取消審判により商標登録を取り消すべき旨の審決が確定したときは、商標権はその審決が確定したときから消滅する。"
    ],
    answer: 1,
    explanation: "ア ×：指定商品又は指定役務についての登録商標の使用が必要です。登録商標と社会通念上同一と認められる商標であれば登録商標の使用と認められますが、原則として登録商標に類似する商標の使用で不使用取消しを免れるものではありません。\n\nイ ○：商標権者が使用をしていなくても、専用使用権者や通常使用権者が使用していれば不使用取消しを免れることができます。\n\nウ ×：立証責任は請求人にあるのが原則ですが、不使用取消審判では被請求人が使用の事実を証明するほうが容易であることから立証責任の転換が図られています。\n\nエ ×：不使用取消審判では、商標権は審判請求登録の日に消滅したものとみなされます。\n\nよって、選択肢イが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "商標法では４つの取消審判制度が規定されています。この中で不使用取消審判は繰り返し出題されています。",
      rows: [
        "商標法は登録主義を採用しているため、実際に使用していない商標でも登録することができます。しかし、商標法は使用により蓄積した業務上の信用を保護することを目的としており、使用されない商標が増えることは好ましいことではありません。そこで、一定の要件のもとに、使用していない商標の商標登録を取り消す制度が設けられています。",
        "不使用取消審判の主な要件は以下の通りです。\n●継続して3年以上使用していない\n●日本国内で使用していない\n●商標権者、専用使用権者又は通常使用権者のいずれもが使用していない\n●指定商品又は指定役務についての登録商標の使用をしていない",
        "審判の審理において、請求人が不使用であることを証明することは困難である一方、被請求人（商標権者）が使用をしていることを証明することは容易と考えられることから、被請求人が使用の事実を証明するよう立証責任の転換が図られています。",
        "また、取消審判では取消審決が確定した後に商標権が消滅するのが原則ですが、不使用取消審判では審判請求登録の日に消滅したものとみなされます。"
      ]
    }
  },
  {
    id: 16,
    title: "問題 16 商標権：侵害と対応策",
    question: "甲社は乙社から、甲社が使用している商標Ａは乙社が5年前に登録した登録商標Ｂの商標権を侵害しているため使用を中止するべしとの警告状を受け取った。このとき甲社が取りうる対応として、最も不適切なものはどれか。",
    options: [
      "商標Ａが商標Ｂの商標権の効力の範囲内に含まれるか否かについて、特許庁に判定を求める。",
      "商標Ｂの指定商品において、商標Ｂが継続して3年以上不使用の状態ではないかを調べる。",
      "商標Ｂに商標法で定める不登録事由がないかを調べ、あれば特許庁に対して異議申立てを行う。",
      "乙社が実際に商標Bの登録を所有しているか否かを、商標登録原簿で調べる。"
    ],
    answer: 2,
    explanation: "ア ○：知的財産権については、特許庁に対する判定制度があります。これは「商標Ａが商標Ｂの商標権の効力の範囲内に含まれるか否か」といった具体的な事案について判断をするものです。したがって、上記⑤の一環として判定を求めることは考えられます。なお、判定の結果には法的拘束力はありません。\n\nイ ○：権利者側の対応⑥に関連します。商標法には不使用取消審判制度があり、これが認められれば商標権は消滅します。不使用取消審判の要件は、1)継続して3年以上、2)日本国内において、3)商標権者・専用使用権者・通常使用権者のいずれもが、4)各指定商品又は指定役務についての登録商標を使用していないことです。したがって、継続して3年以上不使用の状態ではないかを調べることは適切な対応です。\n\nウ ×：上記⑥に関連します。商標法には登録異議の申立ての制度があり、これが認められれば商標権は消滅します。ただし、登録異議の申立ては商標掲載公報の発行の日から2か月以内に限り認められるところ、本肢では登録から5年が経過しています。したがって、登録異議の申立てをすることはできません。なお、登録異議の申立てで取り消された商標権は、初めから存在しなかったものとみなされます。\n\nエ ○：上記⑤の通りです。権利行使の前提として乙社が権利者であること等を商標登録原簿で調べます。\n\nよって、選択肢ウが正解です。",
    importantTable: {
      title: "ここが重要",
      desc: "本問では商標権侵害に関し、被疑侵害者側の対応について問われています。",
      rows: [
        "知的財産権の侵害については、四法ともほぼ同様の規定がされています。権利者側、被疑侵害者側のそれぞれについて、どのような対応を取ることができるのかを整理しておきましょう。",
        "【権利者側の対応】\n①侵害の事実の確認：自社の権利範囲や被疑侵害者の商品を分析し、権利侵害が行われている事実を確認します。\n②警告書の送付：実用新案権の権利行使や秘密意匠の意匠権に基づく差止請求を除いて警告は必須ではありません。しかし、通常は警告書やこれに類するものを送付します。\n③交渉：交渉も必ずしも行われるものではありませんが、通常は警告に続いて当事者間の話し合いで決着を図ります。\n④訴訟：交渉が決裂する等により当事者間で解決ができなければ訴訟に至ります。ここで差止請求、損害賠償請求、不当利得返還請求、信用回復措置請求といった各種の請求を行います。",
        "【被疑侵害者側の対応】\n⑤侵害の事実の確認：権利者側と同様です。通常は登録公報だけではなく原簿や包袋（審査経緯）を閲覧して権利範囲を確定していきます。ここで侵害の事実がないと判断すれば、交渉や訴訟においてその旨を主張・立証します。\n⑥権利の無効化：形式的に権利の侵害に該当しても、その権利の無効が認められるのであれば侵害とはなりません。異議申立てや無効審判により無効にすることや、取消審判により取消すことが考えられます。\n⑦抗弁事由の主張：形式的に権利の侵害に該当しても、その権利を正当に使用する権原があれば侵害とはなりません。先使用権や権利無効の抗弁がこれにあたります。"
      ]
    }
  }
];

// -----------------------------------------------------------------------------
// Main Application Component
// -----------------------------------------------------------------------------
export default function App() {
  const [appState, setAppState] = useState('login'); // login, home, quiz, history
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // ユーザーの学習データ
  const [userData, setUserData] = useState({
    history: {},        // { [questionId]: { isCorrect: boolean, lastAnsweredAt: timestamp } }
    review: {},         // { [questionId]: boolean }
    progressIndex: 0,   // 中断した問題のインデックス
    progressMode: null  // 中断した際のモード (all, wrong, review)
  });

  // クイズの進行状態
  const [quizState, setQuizState] = useState({
    mode: null,
    questions: [],
    currentIndex: 0,
    isAnswered: false,
    selectedOption: null
  });

  // ---------------------------------------------------------------------------
  // 起動時の匿名認証処理
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Firebase Anonymous Auth Success");
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // ---------------------------------------------------------------------------
  // ログイン処理（合言葉でFirestoreからデータ取得）
  // ---------------------------------------------------------------------------
  const handleLogin = async (inputUserId) => {
    if (!inputUserId.trim()) return;
    setLoading(true);
    try {
      const userRef = doc(db, APP_ID, inputUserId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({
          history: data.history || {},
          review: data.review || {},
          progressIndex: data.progressIndex || 0,
          progressMode: data.progressMode || null
        });
        console.log("Loaded existing user data.");
      } else {
        // 新規ユーザー初期化
        const initialData = { history: {}, review: {}, progressIndex: 0, progressMode: null };
        await setDoc(userRef, initialData);
        setUserData(initialData);
        console.log("Created new user document.");
      }
      setUserId(inputUserId);
      setAppState('home');
    } catch (error) {
      console.error("Login/Fetch Error:", error);
      alert("データの読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // クイズ開始・再開処理
  // ---------------------------------------------------------------------------
  const startQuiz = async (mode, forceReset = false) => {
    let targetQuestions = [];
    
    // モードに応じた問題フィルタリング
    if (mode === 'all') {
      targetQuestions = [...quizData];
    } else if (mode === 'wrong') {
      targetQuestions = quizData.filter(q => userData.history[q.id]?.isCorrect === false);
    } else if (mode === 'review') {
      targetQuestions = quizData.filter(q => userData.review[q.id]);
    }

    if (targetQuestions.length === 0) {
      alert("対象の問題がありません。");
      return;
    }

    // 再開か最初からかの判定
    let startIndex = 0;
    if (!forceReset && mode === userData.progressMode && userData.progressIndex > 0 && userData.progressIndex < targetQuestions.length) {
      startIndex = userData.progressIndex;
    }

    setQuizState({
      mode,
      questions: targetQuestions,
      currentIndex: startIndex,
      isAnswered: false,
      selectedOption: null
    });
    setAppState('quiz');

    // リセット指定があった場合はFirestoreもリセット
    if (forceReset) {
      await saveProgress(0, mode);
    } else {
      await saveProgress(startIndex, mode);
    }
  };

  // ---------------------------------------------------------------------------
  // 進捗状況をFirestoreに保存
  // ---------------------------------------------------------------------------
  const saveProgress = async (index, mode) => {
    if (!userId) return;
    try {
      console.log(`Saving progress... index: ${index}, mode: ${mode}`);
      const userRef = doc(db, APP_ID, userId);
      await updateDoc(userRef, {
        progressIndex: index,
        progressMode: mode
      });
      // ローカルステートも更新
      setUserData(prev => ({ ...prev, progressIndex: index, progressMode: mode }));
    } catch (error) {
      console.error("Save Progress Error:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // 解答処理と記録
  // ---------------------------------------------------------------------------
  const handleAnswer = async (optionIndex) => {
    if (quizState.isAnswered) return;

    const currentQ = quizState.questions[quizState.currentIndex];
    const isCorrect = optionIndex === currentQ.answer;

    // ローカルステート更新
    setQuizState(prev => ({
      ...prev,
      isAnswered: true,
      selectedOption: optionIndex
    }));

    const newHistory = {
      ...userData.history,
      [currentQ.id]: {
        isCorrect,
        lastAnsweredAt: new Date().toISOString()
      }
    };

    setUserData(prev => ({ ...prev, history: newHistory }));

    // 次に開くべき問題インデックスを計算
    const nextIndex = quizState.currentIndex + 1;
    
    // Firestoreへ履歴と次回進捗を保存
    try {
      const userRef = doc(db, APP_ID, userId);
      await updateDoc(userRef, {
        history: newHistory,
        progressIndex: nextIndex < quizState.questions.length ? nextIndex : 0,
        progressMode: nextIndex < quizState.questions.length ? quizState.mode : null
      });
    } catch (error) {
      console.error("Save Answer Error:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // 要復習トグル処理
  // ---------------------------------------------------------------------------
  const toggleReview = async (questionId) => {
    const isCurrentlyReviewed = !!userData.review[questionId];
    const newReviewState = { ...userData.review, [questionId]: !isCurrentlyReviewed };
    
    setUserData(prev => ({ ...prev, review: newReviewState }));

    try {
      const userRef = doc(db, APP_ID, userId);
      await updateDoc(userRef, { review: newReviewState });
    } catch (error) {
      console.error("Toggle Review Error:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // 次の問題へ / 終了処理
  // ---------------------------------------------------------------------------
  const handleNext = async () => {
    const nextIndex = quizState.currentIndex + 1;
    if (nextIndex < quizState.questions.length) {
      setQuizState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        isAnswered: false,
        selectedOption: null
      }));
    } else {
      // 完走した場合は進捗をリセット
      await saveProgress(0, null);
      alert("お疲れ様でした！全ての問題が完了しました。");
      setAppState('home');
    }
  };

  // ---------------------------------------------------------------------------
  // ログアウト処理
  // ---------------------------------------------------------------------------
  const handleLogout = () => {
    setUserId('');
    setUserData({ history: {}, review: {}, progressIndex: 0, progressMode: null });
    setAppState('login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-bold text-gray-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // UI 描画: ログイン画面
  // ---------------------------------------------------------------------------
  if (appState === 'login') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-6">
            <BookOpen size={48} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">スマート問題集</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">意匠権と商標権</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.userId.value); }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合言葉 (ユーザーID)
            </label>
            <input
              type="text"
              name="userId"
              required
              placeholder="例: my-secret-key-123"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              学習をはじめる <ChevronRight size={20} />
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-6 text-center">
            PCとスマホで同じ合言葉を入力すると、学習記録を同期できます。
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // UI 描画: ホーム画面
  // ---------------------------------------------------------------------------
  if (appState === 'home') {
    const wrongCount = quizData.filter(q => userData.history[q.id]?.isCorrect === false).length;
    const reviewCount = quizData.filter(q => userData.review[q.id]).length;
    
    const hasResume = userData.progressIndex > 0 && userData.progressMode;
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white shadow-sm px-4 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" /> 意匠権と商標権
          </h1>
          <button onClick={handleLogout} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm">
            <LogOut size={16} /> 終了
          </button>
        </header>

        <main className="p-4 max-w-lg mx-auto mt-4 space-y-6">
          
          {/* 途中再開UI */}
          {hasResume && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="text-blue-600 shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-blue-900">前回の続きから</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    前回は「{userData.progressMode === 'all' ? 'すべての問題' : userData.progressMode === 'wrong' ? '前回不正解のみ' : '要復習のみ'}」の
                    <span className="font-bold ml-1">問題 {userData.progressIndex + 1}</span> まで進んでいます。
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startQuiz(userData.progressMode, false)}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-700 text-sm shadow-sm"
                >
                  <Play size={16} /> 続きから再開
                </button>
                <button
                  onClick={() => startQuiz(userData.progressMode, true)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-50 text-sm shadow-sm"
                >
                  <RotateCcw size={16} /> 最初から
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <List size={20} /> 学習モード選択
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => startQuiz('all', true)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition group flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-gray-800 group-hover:text-blue-700">すべての問題</div>
                  <div className="text-sm text-gray-500">全{quizData.length}問を通しで学習します</div>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-blue-500" />
              </button>
              
              <button 
                onClick={() => startQuiz('wrong', true)}
                disabled={wrongCount === 0}
                className={`w-full text-left p-4 rounded-lg border transition flex justify-between items-center ${wrongCount > 0 ? 'border-gray-200 hover:border-red-400 hover:bg-red-50 group' : 'border-gray-100 opacity-50 cursor-not-allowed bg-gray-50'}`}
              >
                <div>
                  <div className={`font-bold ${wrongCount > 0 ? 'text-gray-800 group-hover:text-red-700' : 'text-gray-400'}`}>前回不正解の問題のみ</div>
                  <div className="text-sm text-gray-500">対象: {wrongCount}問</div>
                </div>
                {wrongCount > 0 && <ChevronRight className="text-gray-400 group-hover:text-red-500" />}
              </button>

              <button 
                onClick={() => startQuiz('review', true)}
                disabled={reviewCount === 0}
                className={`w-full text-left p-4 rounded-lg border transition flex justify-between items-center ${reviewCount > 0 ? 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 group' : 'border-gray-100 opacity-50 cursor-not-allowed bg-gray-50'}`}
              >
                <div>
                  <div className={`font-bold ${reviewCount > 0 ? 'text-gray-800 group-hover:text-yellow-700' : 'text-gray-400'}`}>要復習の問題のみ</div>
                  <div className="text-sm text-gray-500">対象: {reviewCount}問</div>
                </div>
                {reviewCount > 0 && <ChevronRight className="text-gray-400 group-hover:text-yellow-500" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setAppState('history')}
            className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl shadow-md hover:bg-gray-900 transition flex items-center justify-center gap-2"
          >
            <PieChart size={20} /> 学習履歴を確認する
          </button>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // UI 描画: 学習履歴画面
  // ---------------------------------------------------------------------------
  if (appState === 'history') {
    const answeredIds = Object.keys(userData.history);
    const correctCount = answeredIds.filter(id => userData.history[id]?.isCorrect).length;
    const totalCount = quizData.length;
    
    const chartData = [
      { name: '正解', value: correctCount, color: '#3b82f6' },
      { name: '不正解', value: answeredIds.length - correctCount, color: '#ef4444' },
      { name: '未解答', value: totalCount - answeredIds.length, color: '#e5e7eb' }
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white shadow-sm px-4 py-4 flex justify-between items-center sticky top-0 z-10">
          <button onClick={() => setAppState('home')} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
            <Home size={20} /> ホーム
          </button>
          <h1 className="text-lg font-bold text-gray-800">学習履歴</h1>
          <div className="w-16"></div> {/* スペーサー */}
        </header>

        <main className="p-4 max-w-lg mx-auto mt-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center">
            <h2 className="font-bold text-gray-700 mb-4">全体の進捗</h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{Math.round((correctCount / totalCount) * 100 || 0)}<span className="text-lg text-gray-500">%</span></p>
              <p className="text-sm text-gray-500 mt-1">全{totalCount}問中 {correctCount}問正解</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="font-bold text-gray-700 p-4 border-b border-gray-100 bg-gray-50">各問題のステータス</h2>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {quizData.map(q => {
                const hist = userData.history[q.id];
                const isReview = userData.review[q.id];
                return (
                  <div key={q.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium text-gray-800 truncate">{q.title}</p>
                      <div className="flex gap-2 mt-1">
                        {isReview && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">要復習</span>}
                        {!hist && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">未解答</span>}
                      </div>
                    </div>
                    <div>
                      {hist ? (
                        hist.isCorrect 
                          ? <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full"><Check size={16} /></div>
                          : <div className="bg-red-100 text-red-600 p-1.5 rounded-full"><X size={16} /></div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // UI 描画: クイズ出題・解説画面
  // ---------------------------------------------------------------------------
  if (appState === 'quiz') {
    const currentQ = quizState.questions[quizState.currentIndex];
    const isCorrectAnswer = quizState.isAnswered && quizState.selectedOption === currentQ.answer;
    const isReview = !!userData.review[currentQ.id];

    return (
      <div className="min-h-screen bg-gray-100 pb-24">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <button onClick={() => setAppState('home')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
            <Home size={16} /> 中断
          </button>
          <div className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
            {quizState.currentIndex + 1} / {quizState.questions.length}
          </div>
        </header>

        {/* プログレスバー */}
        <div className="h-1.5 w-full bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${((quizState.currentIndex + (quizState.isAnswered ? 1 : 0)) / quizState.questions.length) * 100}%` }}
          />
        </div>

        <main className="p-4 max-w-2xl mx-auto mt-2">
          {/* 問題エリア */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-xs font-bold text-blue-600 mb-2">{currentQ.title}</h2>
            <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{currentQ.question}</p>
          </div>

          {/* 選択肢エリア */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, idx) => {
              // スタイルの判定
              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ";
              let icon = null;

              if (!quizState.isAnswered) {
                btnClass += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700";
                icon = <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</div>;
              } else {
                if (idx === currentQ.answer) {
                  // 正解の選択肢
                  btnClass += "border-blue-500 bg-blue-50 text-blue-900 shadow-sm";
                  icon = <div className="w-6 h-6 rounded-full bg-blue-500 text-white shrink-0 mt-0.5 flex items-center justify-center"><Check size={16} /></div>;
                } else if (idx === quizState.selectedOption) {
                  // 選んだけど不正解だった選択肢
                  btnClass += "border-red-400 bg-red-50 text-red-900";
                  icon = <div className="w-6 h-6 rounded-full bg-red-500 text-white shrink-0 mt-0.5 flex items-center justify-center"><X size={16} /></div>;
                } else {
                  // 選ばれなかった不正解の選択肢
                  btnClass += "border-gray-200 bg-gray-50 text-gray-400 opacity-60";
                  icon = <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</div>;
                }
              }

              return (
                <button
                  key={idx}
                  disabled={quizState.isAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={btnClass}
                >
                  {icon}
                  <span className="leading-relaxed whitespace-pre-wrap pt-0.5">{option}</span>
                </button>
              );
            })}
          </div>

          {/* 解説エリア（回答後のみ表示） */}
          {quizState.isAnswered && (
            <div className="bg-white rounded-xl shadow-md border-t-4 border-t-blue-500 overflow-hidden mb-8 animate-fade-in">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                  {isCorrectAnswer ? (
                    <div className="flex items-center gap-1 text-blue-600 font-bold text-lg">
                      <Check size={24} /> 正解！
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500 font-bold text-lg">
                      <X size={24} /> 不正解
                    </div>
                  )}
                </div>
                
                {/* 要復習トグル */}
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition">
                  <input 
                    type="checkbox" 
                    checked={isReview}
                    onChange={() => toggleReview(currentQ.id)}
                    className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <span className={`text-sm font-bold ${isReview ? 'text-yellow-600' : 'text-gray-500'}`}>
                    要復習
                  </span>
                </label>
              </div>
              
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-500"/> 解説
                  </h3>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap space-y-2">
                    {currentQ.explanation}
                  </div>
                </div>

                {/* 「ここが重要」テーブルの再現 */}
                {currentQ.importantTable && (
                  <div className="mt-6 border border-indigo-200 rounded-lg overflow-hidden">
                    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200 font-bold text-indigo-800 flex items-center gap-2">
                      <AlertCircle size={18} /> {currentQ.importantTable.title}
                    </div>
                    <div className="p-4 bg-white text-sm text-gray-700">
                      {currentQ.importantTable.desc && (
                        <p className="mb-3 font-medium text-gray-900 bg-gray-50 p-2 rounded">{currentQ.importantTable.desc}</p>
                      )}
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {currentQ.importantTable.rows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx !== currentQ.importantTable.rows.length - 1 ? "border-b border-dashed border-gray-200" : ""}>
                              <td className="py-2.5 leading-relaxed whitespace-pre-wrap pl-2 pr-1">{row}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* 次へ進む固定ボタン */}
        {quizState.isAnswered && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                {quizState.currentIndex + 1 < quizState.questions.length ? '次の問題へ' : '結果を見る'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}