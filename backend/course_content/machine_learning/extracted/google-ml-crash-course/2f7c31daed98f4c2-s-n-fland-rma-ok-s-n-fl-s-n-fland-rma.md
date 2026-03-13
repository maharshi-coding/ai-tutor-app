# Sınıflandırma: Çok sınıflı sınıflandırma

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/classification/multiclass
Original Path: https://developers.google.com/machine-learning/crash-course/classification/multiclass
Course: Machine Learning

Sınıflandırma: Çok sınıflı sınıflandırma

Koleksiyonlar ile düzeninizi koruyun

İçeriği tercihlerinize göre kaydedin ve kategorilere ayırın.

Çok sınıflı sınıflandırma, ikili sınıflandırmanın ikiden fazla sınıfa genişletilmesi olarak düşünülebilir. Her örnek yalnızca
bir sınıfa atandıktan sonra, sınıflandırma sorunu şu şekilde ele alınabilir:
ikili sınıflandırma problemi, bir sınıfın birden çok
sınıfları, diğer sınıf ise bir araya getirilmiş diğer tüm sınıfları içerir.
Bu işlem daha sonra orijinal sınıfların her biri için tekrarlanabilir.

Örneğin, üç sınıflı çok sınıflı bir sınıflandırma probleminde,
Burada A , B ve
C problemini iki ayrı ikili program sınıflandırmasına dönüştürebilirsiniz
neden olabilir. Öncelikle, örnekleri kategorize eden bir ikili program sınıflandırıcısı oluşturabilirsiniz
A+B ve C etiketini kullanın. Ardından, A ve B etiketini kullanarak A+B etiketli örnekleri yeniden sınıflandıran ikinci bir ikili sınıflandırıcı oluşturabilirsiniz.

Çok sınıflı bir probleme örnek olarak, elle yazılmış bir basamağın resmini alan ve 0-9 arasında hangi basamağın temsil edildiğine karar veren bir el yazısı sınıflandırıcı verilebilir.

Sınıf üyeliği özel değilse, diğer bir deyişle,
birden fazla sınıfa atanmışsa bu, çok etiketli sınıflandırma olarak bilinir.
sorun.

Yardım Merkezi

Önceki

arrow_back

Tahmin önyargısı (3 dk.)

Sonraki

Programlama alıştırması (15 dk)

arrow_forward

Geri bildirim gönderin

Aksi belirtilmediği sürece bu sayfanın içeriği Creative Commons Atıf 4.0 Lisansı altında ve kod örnekleri Apache 2.0 Lisansı altında lisanslanmıştır. Ayrıntılı bilgi için Google Developers Site Politikaları 'na göz atın. Java, Oracle ve/veya satış ortaklarının tescilli ticari markasıdır.

Son güncelleme tarihi: 2024-11-06 UTC.

Bize geri bildirimde bulunmak mı istiyorsunuz?

[[["Anlaması kolay","easyToUnderstand","thumb-up"],["Sorunumu çözdü","solvedMyProblem","thumb-up"],["Diğer","otherUp","thumb-up"]],[["İhtiyacım olan bilgiler yok","missingTheInformationINeed","thumb-down"],["Çok karmaşık / çok fazla adım var","tooComplicatedTooManySteps","thumb-down"],["Güncel değil","outOfDate","thumb-down"],["Çeviri sorunu","translationIssue","thumb-down"],["Örnek veya kod sorunu","samplesCodeIssue","thumb-down"],["Diğer","otherDown","thumb-down"]],["Son güncelleme tarihi: 2024-11-06 UTC."],[],[]]
