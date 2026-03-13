# Data numerik: Cara model menyerap data menggunakan vektor fitur

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/numerical-data/feature-vectors
Original Path: https://developers.google.com/machine-learning/crash-course/numerical-data/feature-vectors
Course: Machine Learning

Data numerik: Cara model menyerap data menggunakan vektor fitur

Tetap teratur dengan koleksi

Simpan dan kategorikan konten berdasarkan preferensi Anda.

Hingga saat ini, kami telah memberi Anda kesan bahwa model bertindak langsung pada
baris set data; namun, model sebenarnya menyerap data dengan cara yang agak berbeda.

Misalnya, set data menyediakan lima kolom, tetapi hanya dua kolom tersebut (
b
dan
d
) yang merupakan fitur dalam model. Saat memproses
contoh di baris 3, apakah model hanya mengambil konten
dua sel yang ditandai (3b dan 3d) sebagai berikut?

Gambar 1. Bukan cara model mendapatkan contohnya.

Faktanya, model ini sebenarnya menyerap array nilai floating point yang disebut
vektor fitur . Anda dapat menganggap
vektor fitur sebagai nilai floating point yang terdiri dari satu contoh.

Gambar 2. Lebih mendekati kebenaran, tetapi tidak realistis.

Namun, vektor fitur jarang menggunakan nilai mentah set data.
Sebagai gantinya, Anda biasanya harus memproses nilai set data menjadi representasi
yang dapat dipelajari model Anda dengan lebih baik. Jadi, vektor fitur
yang lebih realistis mungkin terlihat seperti ini:

Gambar 3. Vektor fitur yang lebih realistis.

Bukankah model akan menghasilkan prediksi yang lebih baik dengan melakukan pelatihan dari
nilai aktual dalam set data, bukan dari nilai yang diubah ?
Anehnya, jawabannya adalah tidak.

Anda harus menentukan cara terbaik untuk merepresentasikan nilai set data mentah sebagai nilai
yang dapat dilatih dalam vektor fitur.
Proses ini disebut
feature engineering ,
dan merupakan bagian penting dari machine learning.
Teknik teknik engineering fitur yang paling umum adalah:

- Normalisasi : Mengonversi
nilai numerik menjadi rentang standar.

- Pengelompokan (juga disebut sebagai
bucketing ): Mengonversi nilai
numerik menjadi bucket rentang.

Unit ini membahas normalisasi dan pengelompokan. Unit berikutnya,
Menggunakan data kategoris ,
mencakup bentuk lain dari
prapemrosesan , seperti
mengonversi data non-numerik, seperti string, menjadi nilai floating point.

Setiap nilai dalam vektor fitur harus berupa nilai floating point. Namun, banyak
fitur yang secara alami berupa string atau nilai non-numerik lainnya. Akibatnya,
sebagian besar teknik fitur merepresentasikan nilai non-numerik sebagai
nilai numerik. Anda akan melihat banyak hal ini di modul berikutnya.

Pusat Bantuan

Sebelumnya

arrow_back

Pengantar (3 mnt)

Berikutnya

Langkah pertama (5 menit)

arrow_forward

Kirim masukan

Kecuali dinyatakan lain, konten di halaman ini dilisensikan berdasarkan Lisensi Creative Commons Attribution 4.0 , sedangkan contoh kode dilisensikan berdasarkan Lisensi Apache 2.0 . Untuk mengetahui informasi selengkapnya, lihat Kebijakan Situs Google Developers . Java adalah merek dagang terdaftar dari Oracle dan/atau afiliasinya.

Terakhir diperbarui pada 2025-01-03 UTC.

Ada masukan untuk kami?

[[["Mudah dipahami","easyToUnderstand","thumb-up"],["Memecahkan masalah saya","solvedMyProblem","thumb-up"],["Lainnya","otherUp","thumb-up"]],[["Informasi yang saya butuhkan tidak ada","missingTheInformationINeed","thumb-down"],["Terlalu rumit/langkahnya terlalu banyak","tooComplicatedTooManySteps","thumb-down"],["Sudah usang","outOfDate","thumb-down"],["Masalah terjemahan","translationIssue","thumb-down"],["Masalah kode / contoh","samplesCodeIssue","thumb-down"],["Lainnya","otherDown","thumb-down"]],["Terakhir diperbarui pada 2025-01-03 UTC."],[],[]]
