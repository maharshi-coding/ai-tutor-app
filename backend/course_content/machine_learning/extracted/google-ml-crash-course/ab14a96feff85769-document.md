# סיווג

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/classification
Original Path: https://developers.google.com/machine-learning/crash-course/classification
Course: Machine Learning

סיווג

קל לארגן דפים בעזרת אוספים

אפשר לשמור ולסווג תוכן על סמך ההעדפות שלך.

ב מודול הרגרסיה הלוגיסטית ,
למדתם איך להשתמש ב פונקציהsigmoid
כדי להמיר את הפלט של המודל הגולמי לערך בין 0 ל-1 כדי ליצור הסתברות
חיזויים - לדוגמה, חיזוי שלכתובת אימייל מסוימת יש סיכוי של 75%
בתור ספאם. אבל מה קורה אם המטרה שלכם היא לא להפיק תוצאה של הסתברות, אלא קטגוריה – לדוגמה, חיזוי אם הודעת אימייל מסוימת היא 'ספאם' או 'לא ספאם'?

סיווג הוא המשימה של חיזוי לאיזו מתוך קבוצה של מחלקות (קטגוריות) שייכת דוגמה. במודול הזה תלמדו איך להמיר מודל של רגרסיה לוגיסטית שמתבסס על חיזוי הסתברות למודל של סיווג בינארי שמתבסס על חיזוי של אחד משני סיווגים. בנוסף, תלמדו איך לבחור ולחשב מדדים מתאימים כדי להעריך את איכות התחזיות של מודל סיווג. לבסוף,
סיווג לכמה כיתות
קיימות, שנדון בהן בהרחבה בהמשך הקורס.

מרכז העזרה

הקודם

arrow_back

בדיקת הידע (10 דקות)

הבא

ערכי סף ומטריצת הבלבול (12 דקות)

arrow_forward

שליחת משוב

אלא אם צוין אחרת, התוכן של דף זה הוא ברישיון Creative Commons Attribution 4.0 ודוגמאות הקוד הן ברישיון Apache 2.0 . לפרטים, ניתן לעיין ב מדיניות האתר Google Developers‏ .‏ Java הוא סימן מסחרי רשום של חברת Oracle ו/או של השותפים העצמאיים שלה.

עדכון אחרון: 2025-07-27 (שעון UTC).

רוצה לתת לנו משוב?

[[["התוכן קל להבנה","easyToUnderstand","thumb-up"],["התוכן עזר לי לפתור בעיה","solvedMyProblem","thumb-up"],["סיבה אחרת","otherUp","thumb-up"]],[["חסרים לי מידע או פרטים","missingTheInformationINeed","thumb-down"],["התוכן מורכב מדי או עם יותר מדי שלבים","tooComplicatedTooManySteps","thumb-down"],["התוכן לא עדכני","outOfDate","thumb-down"],["בעיה בתרגום","translationIssue","thumb-down"],["בעיה בדוגמאות/בקוד","samplesCodeIssue","thumb-down"],["סיבה אחרת","otherDown","thumb-down"]],["עדכון אחרון: 2025-07-27 (שעון UTC)."],[],[]]
