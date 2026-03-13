# 線性迴歸：梯度下降練習

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent-exercise
Original Path: https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent-exercise
Course: Machine Learning

線性迴歸：梯度下降練習

透過集合功能整理內容

你可以依據偏好儲存及分類內容。

在本練習中，您將重新查看 參數練習 中的燃油效率資料圖表。但這次您會使用梯度下降法，為線性模型找出可將損失降到最低的最佳權重和偏差值。

完成圖表下方的三項工作。

工作 1： 調整圖表下方的「學習率」 滑桿，將學習率設為 0.03。點選「開始」 按鈕，執行梯度下降。

模型訓練需要多久時間才能收斂 (達到穩定的最低損失值)？模型收斂時的 MSE 值為何？哪些權重和偏差值會產生這個值？

按一下加號圖示即可查看解決方案

當我們將學習率設為 0.03 時，模型大約在 30 秒內完成收斂，MSE 為 2.67，權重和偏差值分別為 -1.14 和 20.389。這表示我們已選取合適的學習率值。

工作 2： 按一下圖表下方的「重設」 按鈕，重設圖表中的權重和偏差值。將「Learning Rate」(學習率) 滑桿調整至 1.10e –5 附近的值。點選「開始」 按鈕，執行梯度下降。

您發現這次模型訓練收斂所需的時間有什麼不同嗎？

按一下加號圖示即可查看解決方案

幾分鐘後，模型訓練仍未收斂。權重和偏差值的小幅更新，持續導致損失值略為降低。這表示選擇較高的學習率，可讓梯度下降更快找到最佳權重和偏差值。

工作 3： 按一下圖表下方的「重設」 按鈕，重設圖表中的權重和偏誤值。將「學習率」 滑桿調高至 1。
點選「開始」 按鈕，執行梯度下降。

梯度下降執行時，損失值會發生什麼變化？這次模型訓練需要多久時間才能收斂？

按一下加號圖示即可查看解決方案

如果值偏高 (MSE 超過 300)，損失值就會大幅波動。
這表示學習率過高，模型訓練永遠無法達到收斂。

上一頁

arrow_back

超參數 (10 分鐘)

下一頁

程式設計練習 (20 分鐘)

arrow_forward

提供意見

除非另有註明，否則本頁面中的內容是採用 創用 CC 姓名標示 4.0 授權 ，程式碼範例則為 阿帕契 2.0 授權 。詳情請參閱《 Google Developers 網站政策 》。Java 是 Oracle 和/或其關聯企業的註冊商標。

上次更新時間：2025-12-17 (世界標準時間)。

想進一步說明嗎？

[[["容易理解","easyToUnderstand","thumb-up"],["確實解決了我的問題","solvedMyProblem","thumb-up"],["其他","otherUp","thumb-up"]],[["缺少我需要的資訊","missingTheInformationINeed","thumb-down"],["過於複雜/步驟過多","tooComplicatedTooManySteps","thumb-down"],["過時","outOfDate","thumb-down"],["翻譯問題","translationIssue","thumb-down"],["示例/程式碼問題","samplesCodeIssue","thumb-down"],["其他","otherDown","thumb-down"]],["上次更新時間：2025-12-17 (世界標準時間)。"],[],[]]
