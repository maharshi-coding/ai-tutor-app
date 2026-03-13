# 記錄解謎 Python 運動

Source: Google's Python Class
Original URL: https://developers.google.com/edu/python/exercises/log-puzzle
Original Path: https://developers.google.com/edu/python/exercises/log-puzzle
Course: Python Programming

記錄解謎 Python 運動

透過集合功能整理內容

你可以依據偏好儲存及分類內容。

在 Log Puzzle 練習中，你需要使用 Python 程式碼來解開兩個謎題。本練習使用 urllib 模組，如 Python 公用程式 一節所示。這項練習的檔案位於「logpuzzle」中google-python-exercises 內的目錄 (如果還沒有下載 google-python-exercises.zip ，請先下載，詳情請參閱「 設定 」一節)。將程式碼新增至「logpuzzle.py」檔案。

動物的圖片被分割成許多狹窄的垂直條紋圖片。網路上有條紋圖片，而圖片各有專屬的網址。網址不會顯示在網路伺服器記錄檔中。你的任務是找出網址，並下載所有圖片條紋，重新製作原始圖片。

配量網址隱藏在 apache 記錄檔中 (開放原始碼 apache 網路伺服器是網際網路上最常用的伺服器)。每個記錄檔都來自某些伺服器，而所需的片段網址則隱藏在記錄中。記錄檔會將伺服器的來源伺服器編碼，如下所示：由 code.google.com 伺服器送出的記錄檔動物。native_code.google.com 記錄檔包含「animal」的資料謎題圖片。雖然記錄檔中的資料採用真正的 Pacheche 網路伺服器語法，但是除了謎題所需的資料外，其他的資料則是從真實的記錄檔中隨機化資料。

以下是記錄檔中的單行程式碼 (實際上是封包記錄檔外觀)：

10.254.254.28 - - [06/Aug/2007:00:14:08 -0700] "GET /foo/talks/ HTTP/1.1"
200 5910 "-" "Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.4) Gecko/20070515 Firefox/2.0.0.4"

前幾個數字是提出要求瀏覽器的位址。最有趣的部分是「GET path HTTP」會顯示伺服器接收網路要求的路徑。路徑本身一律不會包含空格，而且與 GET 和 HTTP 以空格分隔 (規則運算式建議：\S (大寫建議 S) 會比對任何非空格字元)。在記錄中找出「puzzle」字串，出現在路徑中，並忽略記錄中其他許多其他行。

A 部分 - 記錄至網址

完成 read_urls(filename) 函式，從記錄檔中擷取謎題網址。搜尋所有謎題記錄檔中的路徑網址將每個網址的路徑與檔案名稱中的伺服器名稱結合，形成完整的網址，例如"http://www.example.com/path/puzzle/from/inside/file".過濾出現多次的網址。read_urls() 函式應傳回完整網址清單，並按照字母順序排列，而且不含重複項目。如果按照字母順序取得網址，系統會依由左至右的順序產生圖片片段，用來重現原始動物圖像。在最簡單的情況下，main() 應顯示網址，每行一個。

$ ./logpuzzle.py animal_code.google.com
http://code.google.com/something/puzzle-animal-baaa.jpg
http://code.google.com/something/puzzle-animal-baab.jpg
...

B 部分 - 下載圖片拼圖

完成 download_images() 函式，此函式可使用經過排序的網址和目錄清單。從每個網址下載圖片到指定的目錄，視需要先建立目錄 (請參閱「os」模組建立目錄，或參閱「urllib.urlretrieve()」下載網址)。請使用簡單的配置來為本機圖片檔命名，例如「img0」、「img1」、「img2」等等。您可能需要列印一點「擷取中...」文字，下載每張圖像時的狀態輸出行，因為這可能會很慢，而且可以有一些跡象表明程式正在運作。每張圖片都是原始圖片的一小部分。如何拼配這些片段，創作出原創作品？只要使用一點 html 即可解決問題 (不需要對 HTML 有瞭解)。

download_images() 函式還會在目錄中建立一個 index.html 檔案，並加上 *img* 標記，以顯示每個本機圖片檔。img 標記必須在同一行，中間不分隔。如此一來，瀏覽器就能順暢地顯示所有區塊。不需要 HTML 知識即可進行這項操作；只需建立一個 index.html 檔案，如下所示：

<html>
<body>
<img src="img0"><img src="img1"><img src="img2">...
</body>
</html>

下載動物謎題後，畫面會如下所示：

$ ./logpuzzle.py --todir animaldir animal_code.google.com
$ ls animaldir
img0 img1 img2 img3 img4 img5 img6 img7 img8 img9 index.html

如果一切正常，在瀏覽器中開啟 index.html 網頁，應該會顯示原始動物圖片。圖片中的動物是什麼？

C 部分 - 圖片片段脫糖

第二個謎題包含知名地點的圖片，但受到自訂排序的影響。針對第一個謎題，網址可以依照字母順序排列，使圖片正確排序。排序過程中會使用整個網址。不過，如果網址結尾是「- wordchars - wordchars .jpg"，例如「http://example.com/foo/puzzle/bar-abab-baaa.jpg」，則網址應以排序中的「第二個」 字詞表示 (例如「baaa」)。因此，排序以 word-word.jpg 模式結尾的網址清單時，網址會按第二個字詞排序。

擴展程式碼以正確排列這類網址，然後您應該能夠解碼第二個顯示知名地點的 place_code.google.com 謎題。顯示的地點為何？

CC 姓名標示：本謎題中使用的圖片是由擁有者依 創用 CC 姓名標示 2.5 授權提供，如此足以鼓勵該作品的重混作品使用此類內容。動物圖片取自使用者在閃爍過程中的驚嘆號，且地點圖片來自使用者的布林分割畫面。

除非另有註明，否則本頁面中的內容是採用 創用 CC 姓名標示 4.0 授權 ，程式碼範例則為 阿帕契 2.0 授權 。詳情請參閱《 Google Developers 網站政策 》。Java 是 Oracle 和/或其關聯企業的註冊商標。

上次更新時間：2025-07-24 (世界標準時間)。

[[["容易理解","easyToUnderstand","thumb-up"],["確實解決了我的問題","solvedMyProblem","thumb-up"],["其他","otherUp","thumb-up"]],[["缺少我需要的資訊","missingTheInformationINeed","thumb-down"],["過於複雜/步驟過多","tooComplicatedTooManySteps","thumb-down"],["過時","outOfDate","thumb-down"],["翻譯問題","translationIssue","thumb-down"],["示例/程式碼問題","samplesCodeIssue","thumb-down"],["其他","otherDown","thumb-down"]],["上次更新時間：2025-07-24 (世界標準時間)。"],[],[]]
