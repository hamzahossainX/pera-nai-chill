export interface DialogueLine {
  bn: string;
  en: string;
}

export interface ComboTier {
  threshold: number;
  title: {
    bn: string;
    en: string;
  };
  color: string;
}

export const COMBO_NAMES: ComboTier[] = [
  { threshold: 3, title: { bn: "চপ্পল স্পেশাল!", en: "SLIPPER SPECIAL!" }, color: "#38bdf8" },
  { threshold: 5, title: { bn: "দমাদম মাইর!", en: "RAPID SLAP!" }, color: "#facc15" },
  { threshold: 10, title: { bn: "তুফান কম্বো!", en: "STORM COMBO!" }, color: "#fb923c" },
  { threshold: 15, title: { bn: "প্যারা নাই চিল!", en: "NO TENSION CHILL!" }, color: "#f43f5e" },
  { threshold: 20, title: { bn: "ঢাকার সুলতান!", en: "SULTAN OF DHAKA!" }, color: "#c084fc" },
  { threshold: 25, title: { bn: "আলটিমেট চপ্পলবাজ!", en: "GODLIKE CHAPPAL!" }, color: "#a855f7" },
];

export const COMMENTATOR_TICKER: DialogueLine[] = [
  {
    bn: "ব্রেকিং: চোর ধরতে গিয়ে চপ্পল হারালো সাধারণ জনতা!",
    en: "BREAKING: Public loses slipper while chasing thief!",
  },
  {
    bn: "বিশেষজ্ঞদের মতে, চপ্পলের গতি আজ রেকর্ড ভাঙছে।",
    en: "Experts say slipper velocity breaks records today.",
  },
  {
    bn: "মিরপুর রোডে চোর বনাম জনতার অবিশ্বাস্য রেস!",
    en: "Unbelievable race between thief and public on Mirpur Road!",
  },
  {
    bn: "আবহাওয়া অধিদপ্তর: আজ চপ্পল বৃষ্টির সম্ভাবনা ৯০%!",
    en: "Weather Bureau: 90% chance of slipper rain today!",
  },
  {
    bn: "খবর: বাটার স্যান্ডেলের চাহিদা আজ তুঙ্গে!",
    en: "News: Bata sandals demand at all-time high!",
  },
  {
    bn: "ট্রাফিক আপডেট: চোর দৌড়ানোর কারণে রাস্তায় তীব্র যানজট!",
    en: "Traffic Update: Severe traffic jam caused by thief sprint!",
  },
  {
    bn: "জনতা সতর্ক: নিজের মোবাইল ও চপ্পল সাবধানে রাখুন!",
    en: "Public Alert: Keep your phones and slippers safe!",
  },
  {
    bn: "লাইভ আপডেট: চোরের স্পিড বাড়ানোর চেষ্টা বিফলে গেল!",
    en: "Live Update: Thief attempt to accelerate ends in failure!",
  },
  {
    bn: "বিজ্ঞপ্তি: রাস্তায় অযথা চপ্পল কুড়াবেন না!",
    en: "Notice: Do not pick up flying slippers from the street!",
  },
  {
    bn: "চাচা খবর দিলেন: এবার চোর ধরা খাবেই খাবে!",
    en: "Uncle reports: The thief will definitely get caught now!",
  },
  {
    bn: "সরাসরি ঢাকা: এক চপ্পলে দুই মোড় পার!",
    en: "Direct from Dhaka: Two intersections cleared in one slipper throw!",
  },
  {
    bn: "দর্শকদের উল্লাস: জনতার চপ্পলবাজি থামানো যাচ্ছে না!",
    en: "Crowd cheers: No stopping the public's slipper barrage!",
  },
];

export const DIALOGUE_GROUPS = {
  villain_taunt: [
    { bn: "ভাই, আমি শুধু রাস্তা দিয়ে হাঁটছিলাম!", en: "Bro, I was just walking down the road!" },
    { bn: "দৌড়ানোর জন্যই তো জিম মেম্বারশিপ নিছি!", en: "This is why I bought a gym membership!" },
    { bn: "চপ্পল ছুঁড়বেন না, এটা ব্র্যান্ডের গেঞ্জি!", en: "Don't throw slippers, this is a branded shirt!" },
    { bn: "আরে ভাই, চরম ভুল বোঝাবুঝি হইছে!", en: "Hey bro, it's a huge misunderstanding!" },
    { bn: "আমার তো জরুরি ব্যাক্তিগত কাজ ছিল!", en: "I had urgent personal business!" },
    { bn: "আমার স্পিড দেখার মতো, ধরতে পারবা না!", en: "My speed is legendary, you can't catch me!" },
    { bn: "পুলিশ ডাকবেন না, আমি নিজেই আত্মসমর্পণ করব!", en: "Don't call police, I'll surrender myself!" },
    { bn: "আমার চশমাটা একটু ধরেন ভাই!", en: "Hold my glasses please bro!" },
    { bn: "আজকের মতো ছেড়ে দেন ভাই, প্লিজ!", en: "Let me go just for today bro, please!" },
    { bn: "এই চপ্পলের সাইজ আমার পায়ে ফিট হবে না!", en: "This slipper size won't fit my feet!" },
  ],
  villain_hit: [
    { bn: "আউচ! এইটা চপ্পল না, এইটা অত্যাচার!", en: "Ouch! That's not a slipper, that's torture!" },
    { bn: "বাপরে! পিঠের হাড্ডি ভাইঙ্গা গেল!", en: "Oh lord! My back bone just cracked!" },
    { bn: "চপ্পলে এত জোর কিসের ভাই?!", en: "Why is there so much power in a slipper?!" },
    { bn: "দয়া করেন ভাই, কালকে আমার পরীক্ষা!", en: "Have mercy, I have an exam tomorrow!" },
    { bn: "উফফ! চপ্পল দিয়া কেউ এভাবে মারে?!", en: "Uff! Who hits this hard with a slipper?!" },
    { bn: "মাফ কইরা দেন, আর জীবনেও চুরি করুম না!", en: "Forgive me, I will never steal again in life!" },
    { bn: "আমার মাথা ঘুরতেছে রে ভাই!", en: "My head is spinning bro!" },
    { bn: "চপ্পলের বাড়ি খেয়ে সব ভুলে গেলাম!", en: "I forgot everything after that slipper hit!" },
    { bn: "চপ্পলের ভেতর কি লোহা ঢুকাইছেন?!", en: "Did you put iron inside that slipper?!" },
    { bn: "আল্লাহ গো! আজকের মতো ছাড়েন!", en: "Oh dear! Spare me just for today!" },
  ],
  villain_lowHp: [
    { bn: "মাফ করে দেন... আগামী সপ্তাহ পর্যন্ত আর করব না!", en: "Forgive me... won't do it again until next week!" },
    { bn: "আমার নিঃশ্বাস শেষ, অ্যাম্বুলেন্স ডাকেন!", en: "I'm out of breath, call an ambulance!" },
    { bn: "আর পারতেছি না, চপ্পল থামান!", en: "I can't take it anymore, stop the slippers!" },
    { bn: "সব চোরাই মাল দিয়ে দিলাম, ছাড়েন!", en: "I gave back all stolen goods, let me go!" },
    { bn: "চোখে সর্ষে ফুল দেখতেছি রে ভাই!", en: "I'm seeing stars everywhere bro!" },
    { bn: "বসে পড়লাম ভাই, আর দৌড়াতে পারব না!", en: "I'm sitting down, can't run another step!" },
    { bn: "চপ্পলের বাড়ি খেয়ে আমি শেষ!", en: "I'm finished from all these slipper hits!" },
    { bn: "ভাইরে ভাই, জনতা এত রাগ কেন?!", en: "Bro why is the public so angry?!" },
    { bn: "আমাকে ছেড়ে দেন, আমি তো ভালো ছেলে!", en: "Let me go, I was actually a good boy!" },
    { bn: "হাত জোড় করতেছি ভাই, ক্ষান্ত দেন!", en: "I fold my hands, please stop hitting!" },
  ],
  villain_dodge: [
    { bn: "মিস হইলো রে ভাতিজা!", en: "Missed me, nephew!" },
    { bn: "চপ্পলের নিশানা দুর্বল!", en: "Weak slipper aim!" },
    { bn: "এই স্পিড ধরতে পারবা না!", en: "Can't touch this speed!" },
    { bn: "বাতাসের মতো পালাইলাম!", en: "Escaped like the wind!" },
    { bn: "আরেকটু প্র্যাকটিস লাগবে ভাই!", en: "Need a bit more practice bro!" },
    { bn: "হাওয়ায় চপ্পল ভেসে গেল!", en: "Slipper sailed into thin air!" },
    { bn: "আমার সাইড-স্টেপ মারাত্মক!", en: "My side-step is lethal!" },
    { bn: "লাগে নাই তো! লাগে নাই!", en: "Didn't hit! Didn't hit!" },
    { bn: "মিরপুরের চোর এত সহজে মরে না!", en: "A Mirpur thief doesn't go down easily!" },
    { bn: "চপ্পল লক্ষ্যভ্রষ্ট!", en: "Slipper missed its mark!" },
  ],
  chaser_taunt: [
    { bn: "এইবার হিসাব মেলাবো!", en: "Time to settle the accounts!" },
    { bn: "থামো, চা খাওয়াবো!", en: "Stop, I'll buy you tea!" },
    { bn: "চপ্পলটা পুরনো, কিন্তু তাগড়া!", en: "Old slipper, strong arm!" },
    { bn: "পালিয়ে যাবি কই? পুরা ঢাকা শহর আমার চেনা!", en: "Where will you run? I know all of Dhaka!" },
    { bn: "চুরির শখ এবার চিরতরে ছুটাবো!", en: "I'll cure your stealing habit forever!" },
    { bn: "এক চপ্পলে মিরপুর, আরেক চপ্পলে ফার্মগেট!", en: "One slipper to Mirpur, the next to Farmgate!" },
    { bn: "আজকে ধরা খাবিই খাবি!", en: "You're definitely getting caught today!" },
    { bn: "দৌড়ায়া পার পাবি না ভাতিজা!", en: "You can't outrun me nephew!" },
    { bn: "চপ্পলের নিশানা মিস হয় না!", en: "Slipper aim never misses!" },
    { bn: "চা-বিস্কুট খাওয়ার টাইম শেষ!", en: "Tea and biscuits time is over!" },
  ],
  chaser_hit: [
    { bn: "সোজা টার্গেটে লাগছে!", en: "Direct hit on target!" },
    { bn: "চপ্পলের পাওয়ার দেখলি তো?!", en: "Witnessed the power of the slipper?!" },
    { bn: "বাটার সলিড বাড়ি!", en: "Solid Bata slap!" },
    { bn: "আর একবার চেষ্টা কর পালাবি!", en: "Try running away one more time!" },
    { bn: "ধরা খাইতে আর বেশি বাকি নাই!", en: "Not long before you're caught!" },
    { bn: "চপ্পলের আওয়াজে কান তালা!", en: "Ears ringing from that slap!" },
    { bn: "চোর ধরার আনন্দই আলাদা!", en: "Nothing beats the joy of catching a thief!" },
    { bn: "এক শটেই কাজ হইছে!", en: "One shot did the job!" },
    { bn: "এবার দৌড় থামাও!", en: "Now stop your sprinting!" },
    { bn: "হিসাব ক্লিয়ার করতেছি!", en: "Clearing the balance sheet!" },
  ],
  event_loadshedding: [
    { bn: "আবার কারেন্ট গেল! চোর কই?", en: "Power's gone again! Where's the thief?" },
    { bn: "লাইনম্যান ভাই, একটু দয়া করেন!", en: "Lineman bhai, have mercy!" },
    { bn: "অন্ধকারে চপ্পলও দেখি না!", en: "Can't even see the slippers in the dark!" },
    { bn: "মোবাইলের ফ্ল্যাশলাইট জ্বালাও!", en: "Turn on the phone flashlight!" },
    { bn: "কারেন্ট নাই তো কি হইছে, চপ্পল চার্জড!", en: "No electricity? Slipper is fully charged!" },
    { bn: "ঘোর অন্ধকারেও চোখ জ্বলতেছে চোরের!", en: "Thief's eyes are glowing even in pitch dark!" },
  ],
  event_pollution: [
    { bn: "বাতাসে এত ধুলা, চোরও কাশতেছে!", en: "So much dust, even the thief is coughing!" },
    { bn: "মাস্ক ছাড়া দৌড়ানো অসম্ভব!", en: "Impossible to run without a mask!" },
    { bn: "চোখে ধুলা ঢুকলো রে!", en: "Dust got in my eyes!" },
    { bn: "একটু ফ্রেশ বাতাস দে রে ভাই!", en: "Give me some fresh air bro!" },
    { bn: "ধোঁয়ার ভেতর দিয়াও চপ্পল পৌঁছাবে!", en: "Slipper will reach even through the smoke!" },
    { bn: "ঢাকার বাতাস চোররেও কাবু করছে!", en: "Dhaka air broke even the thief down!" },
  ],
  event_strike: [
    { bn: "রাস্তায় জ্যাম, চোর আটকাইছে নিজেই!", en: "Traffic jam, the thief got stuck himself!" },
    { bn: "হরতালের মধ্যে আবার দৌড়াদৌড়ি!", en: "Running around during a strike!" },
    { bn: "রাস্তা বন্ধ, এখন কোনদিকে যাবি?", en: "Road is blocked, where will you run now?" },
    { bn: "মিছিলের পিছনে চোর লুকাইছে!", en: "Thief hid behind the rally!" },
    { bn: "টায়ার জ্বালায় লাভ নাই, চপ্পল আসতেছে!", en: "Burning tyres won't help, slipper is coming!" },
    { bn: "জনতার মিছিল চোররে ঘেরাও করছে!", en: "The public rally surrounded the thief!" },
  ],
  event_flood: [
    { bn: "জলাবদ্ধতা! চোর সাঁতার জানে না!", en: "Waterlogging! The thief can't swim!" },
    { bn: "চপ্পল ভাইসা যাইতেছে!", en: "Slippers are floating away!" },
    { bn: "হাটু সমান পানিতে দৌড়াদৌড়ি!", en: "Running in knee-deep water!" },
    { bn: "নৌকা লাগবে নাকি ভাই?", en: "Need a boat bro?" },
    { bn: "পানির স্পিডে চপ্পলও টর্পেডো!", en: "Slipper moves like a torpedo in water!" },
    { bn: "বৃষ্টির দিনে চোর ধরার মজাই আলাদা!", en: "Fun catching thieves on rainy days!" },
  ],
};
