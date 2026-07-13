// ============================================================
// All user-facing Turkish text lives here so it's easy to edit.
// ============================================================

export const COPY = {
 appName:'Mochiverse',

 onboarding: [
 {
 emoji:'',
 title:'Minik bir dost seni bekliyor',
 body:'Yumurtandan bir Mochi çıkacak. Ona bir isim ver, onunla ilgilen, birlikte büyüyün.',
 },
 {
 emoji:'',
 title:'Odaklandıkça büyür',
 body:'Her odak seansı Mochi’ni besler, mutlu eder ve evrimleştirir. Sen çalışırken o huzurla uyur.',
 },
 {
 emoji:'',
 title:'İhmal edersen… sonsuza dek kaybedersin',
 body:'Aç ve mutsuz kalırsa hastalanır. Sağlığı biterse geri dönmez. Ne diriltme, ne geri alma. Gerçekten.',
 },
 ],

 hatch: {
 tapEgg:'Yumurtaya dokun ve çatlat',
 naming:'Ona bir isim ver',
 placeholder:'Mochi’nin adı…',
 confirm:'Tanıştığımıza sevindim!',
 hatching:'Çatlıyor…',
 mystery:'Gizemli minik bir dost!',
 },

 home: {
 focus:'Odaklan',
 menu:'Menü',
 feed:'Besle',
 heal:'İlaç ver',
 hunger:'Açlık',
 mood:'Keyif',
 health:'Sağlık',
 noCandy:'Şeker yok! Odaklanarak şeker kazan.',
 noMed:'İlaç yok! Odaklanarak kazan.',
 fed:'Nefis!',
 healed:'Kendini daha iyi hissediyor',
 notSick:'Şu an hasta değil.',
 petMax:'Biraz dinlensin, sonra tekrar sev',
 critical:'Mochi sana ihtiyaç duyuyor!',
 played:'Çok eğlenceli!',
 },

 focus: {
 choose:'Ne kadar odaklanalım?',
 custom:'Özel',
 min:'dk',
 start:'Başla',
 sleeping:'uyuyor…',
 giveUpHold:'Vazgeçmek için basılı tut',
 giveUpHint:'Bırakırsan kalbi kırılacak…',
 watchWarn:'Mochi seni izliyor… geri dön!',
 quitToast:'Mochi çok üzüldü…',
 complete:'Seans tamam!',
 focusing:'odaklanıyorsun',
 subject:'Konu',
 general:'Genel',
 newSubject:'Yeni konu',
 subjectName:'Konu adı',
 add:'Ekle',
 },

 complete: {
 title:'Harikaydın!',
 subtitle:'Mochi seninle gurur duyuyor',
 rewards:'Ödüller',
 candy:'şeker',
 medicine:'ilaç',
 streak:'gün seri',
 next:'Devam',
 evolveSoon:'Evrime çok az kaldı!',
 },

 evolution: {
 title:'EVRİM!',
 toTeen:'Mochi büyüdü!',
 toBaby:'Şeklini aldı!',
 toLegendary:'Efsane oldu!',
 label:'Evrim',
 },

 death: {
 revive:'Canlandır',
 reviveFree:'Ücretsiz canlandır',
 revived:'Tekrar hoş geldin! 💖',
 reviveHint:'Onu geri getir — Premium ile ücretsiz',
 title:'Elveda…',
 rip:'Huzur içinde uyu',
 lived:'gün yaşadı',
 focusHours:'saat odak',
 toMemorial:'Anı Bahçesi’ne uğurla',
 newEgg:'Yeni bir yumurta başlat',
 },

 memorial: {
 title:'Anı Bahçesi',
 subtitle:'Kaybettiğimiz minik dostlar',
 empty:'Henüz kimseyi kaybetmedin. Böyle kalsın.',
 born:'Doğum',
 died:'Vefat',
 survived:'Yaşadı',
 },

 stats: {
 title:'İstatistikler',
 heatmap:'Odak takvimi',
 longestStreak:'En uzun seri',
 totalHours:'Toplam odak',
 totalSessions:'Toplam seans',
 hours:'saat',
 days:'gün',
 less:'az',
 more:'çok',
 thisWeek:'Bu hafta',
 bySubject:'Konuya göre',
 noSubjectData:'Bir konuyla odaklan, burada görün',
 },

 shop: {
 title:'Dükkan',
 buy:'Al',
 owned:'adet',
 noCoins:'Yeterli altın yok!',
 bought:'Satın alındı!',
 food:'Yiyecek',
 medicine:'İlaç',
 toy:'Oyuncak',
 cosmetic:'Süs',
 coins:'altın',
 confirmBuy:'Satın al',
 equip:'Tak',
 unequip:'Çıkar',
 },

 settings: {
 title:'Ayarlar',
 language:'Dil',
 sound:'Ses',
 soundOn:'Açık',
 soundOff:'Kapalı',
 },

 collection: {
 title:'Koleksiyon',
 subtitle:'Keşfettiğin türler',
 locked:'Kilitli',
 },

 items: {
 candy:'Şeker',
 apple:'Elma',
 fish:'Balık',
 cake:'Pasta',
 medicine:'İlaç',
 ball:'Top',
 star_toy:'Yıldız Oyuncağı',
 bow:'Fiyonk',
 crown:'Taç',
 top_hat:'Silindir Şapka',
 party_hat:'Parti Şapkası',
 flower_crown:'Çiçek Tacı',
 wizard_hat:'Büyücü Şapkası',
 cap:'Kep',
 halo:'Hale',
 glasses:'Gözlük',
 sunglasses:'Güneş Gözlüğü',
 headphones:'Kulaklık',
 scarf:'Atkı',
 cat_ears:'Kedi Kulağı',
 devil_horns:'Şeytan Boynuzu',
 tiara:'Tiara',
 heart_glasses:'Kalp Gözlük',
 bowtie:'Papyon',
 } as Record<string, string>,

 coinReward:'altın kazandın!',

 stage: { blob:'Yavru', baby:'Bebek', teen:'Genç', legendary:'Efsane' },

 common: {
 back:'Geri',
 days:'gün',
 age:'Yaş',
 },

 premium: {
 menu:'Premium', title:'Mochiverse Premium', subtitle:'Her şey, tek plan.',
 perMonth:'/ay', cta:'Abone Ol', restore:'Satın almayı geri yükle', active:'Premium aktif ✨',
 thanks:'Mochiverse’i desteklediğin için teşekkürler! 💖', manage:'Premium üyesin.',
 benefitThemes:'Tüm premium temalar', benefitThemesSub:'Gün batımı, aurora, sakura, gece yarısı ve dahası',
 benefitSkins:'Özel pet skinleri', benefitSkinsSub:'Altın, kozmik ve nane parıltısı',
 benefitStats:'Pro odak istatistikleri', benefitStatsSub:'Haftalık raporlar, hedefler ve detaylı grafikler',
 benefitRevive:'Ücretsiz diriltme', benefitReviveSub:'Pet’ini asla kaybetme — ücretsiz geri getir',
 benefitCare:'Yavaş yaşlanma', benefitCareSub:'Pet’ler %40 daha uzun mutlu kalır',
 benefitSupport:'Geliştirmeye destek ol', benefitSupportSub:'Mochi büyümeye devam etsin',
 locked:'Premium', unlock:'Premium ile aç', legal:'Aylık otomatik yenilenir. İstediğin zaman iptal.',
 },
 themes: { title:'Tema', day:'Gündüz', night:'Gece', sunset:'Gün Batımı', aurora:'Aurora', sakura:'Sakura', midnight:'Gece Yarısı', ocean:'Okyanus', galaxy:'Galaksi', candy:'Şeker', forest:'Orman', dawn:'Şafak', ember:'Kor', frost:'Ayaz' },
 skins: { title:'Pet skini', original:'Orijinal', golden:'Altın', cosmic:'Kozmik', mint:'Nane', rainbow:'Gökkuşağı', shadow:'Gölge', rose:'Gül', aqua:'Su' },
 pro: { title:'Pro içgörüler', weekTotal:'Bu hafta', goalHint:'Premium ile haftalık odak hedefi koy', locked:'Pro istatistikleri aç', weeklyGoal:'Haftalık hedef', setGoal:'Hedef', goalReached:'Hedefe ulaşıldı! 🎉', ofGoal:'hedefin', noGoal:'Hedef yok' },
 coins: { title:'Coin al', subtitle:'Coin bakiyeni doldur', popular:'POPÜLER', bestValue:'EN İYİ DEĞER', got:'Coinler eklendi! 🪙', unit:'coin', legal:'Tek seferlik satın alma. Coinler anında eklenir.' },
 sounds: { title:'Odak sesi', off:'Sessiz', lofi:'Lofi', piano:'Piyano', rain:'Yağmur' },
 reminder: { title:'Günlük hatırlatıcı', off:'Kapalı', set:'Bana hatırlat', on:'Açık' },
} as const;

export const MONTHS_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
export const WEEKDAYS_TR = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
