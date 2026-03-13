# <div dir="rtl" style="direction:rtl;text-align:right;">

Source: Hugging Face Course
Original URL: https://github.com/huggingface/course/blob/HEAD/chapters/ar/chapter0/1.mdx
Original Path: chapters/ar/chapter0/1.mdx
Course: Artificial Intelligence

<div dir="rtl" style="direction:rtl;text-align:right;">
يمكنك التأكد من تثبيت الحزمة بشكل صحيح عن طريق استيرادها (import) خلال وقت تشغيل Python:
</div>

```
import transformers
```

<div class="flex justify-center">
<img src="https://huggingface.co/datasets/huggingface-course/documentation-images/resolve/main/en/chapter0/install.gif" alt="A gif showing the result of the two commands above: installation and import" width="80%"/>
</div>

<div dir="rtl" style="direction:rtl;text-align:right;">
هذا يثبت نسخة خفيفة جدا من مكتبة 🤗 Transformers. أي أنه لم يتم تثبيت أي إطارات عمل محددة للتعلم الآلي (مثل PyTorch أو TensorFlow). نوصي بتثبيت "إصدار التطوير" للمكتبة لأننا سوف نستخدم الكثير من الميزات المختلفة, و هذا الإصدار يأتي مع جميع التبعيات المطلوبة تقريباً لأي حالة استخدام يمكن تخيلها:

</div>

```
!pip install transformers[sentencepiece]
```

<div dir="rtl" style="direction:rtl;text-align:right;">
سيستغرق هذا بعض الوقت، لكنك ستكون جاهزًا بعد ذلك لبقية الدورة!

## استخدام بيئة Python افتراضية

إذا كنت تفضل استخدام بيئة Python الافتراضية، فإن الخطوة الأولى هي تثبيت Python على نظامك. للبدء, نوصي باتباع [دليل الإرشادات هذا](https://realpython.com/installing-python/).

بمجرد تثبيت Python، يجب أن تكون قادرًا على تشغيل أوامر Python في الجهاز المستخدم. للتأكد من تثبيته بشكل صحيح قبل المتابعة إلى الخطوات التالية يمكنك البدء بتشغيل الأمر التالي: `python --version`. يجب أن يطبع هذا إصدار Python المتاح الآن على نظامك.

عند تشغيل أمر Python في الجهاز المستخدم، مثل `python --version`، يجب أن تفكر في البرنامج الذي يقوم بتشغيل الأمر الخاص بك باعتباره Python "الرئيسي" على نظامك. نوصي بالحفاظ على هذا التثبيت الرئيسي خاليًا من أي حزم، واستخدامه لإنشاء بيئات منفصلة لكل تطبيق تعمل عليه, وبهذه الطريقة، يمكن لكل تطبيق أن يكون له تبعيات وحزم خاصة به، ولن تقلق بشأن مشكلات التوافق المحتملة مع تطبيقات أخرى.

في Python، يتم ذلك باستخدام [* البيئات الافتراضية *](https://docs.python.org/3/tutorial/venv.html)، وهي عبارة عن تفرعات من المجلدات كل منها قائم بحد ذاته, ويحتوي كل منها على Python مثبت بإصدار معين بالإضافة إلى جميع الحزم التي يحتاجها التطبيق. يمكن إنشاء مثل هذه البيئة الافتراضية باستخدام عدد من الأدوات المختلفة ، لكننا سنستخدم حزمة Python الرسمية لهذا الغرض، والتي تسمى [`venv`](https://docs.python.org/3/library/venv.html#module-venv).

أولاً، قم بإنشاء المجلد الذي تريد أن يتواجد فيه التطبيق الخاص بك -على سبيل المثال، قد ترغب في إنشاء مجلد جديد يسمى *transformers-course* في المجلد الرئيسي للدورة:
</div>

```
mkdir ~/transformers-course
cd ~/transformers-course
```

<div dir="rtl" style="direction:rtl;text-align:right;">

من داخل هذا المجلد، أنشئ بيئة افتراضية باستخدام وحدة Python `venv`:

</div>

```
python -m venv .env
```

<div dir="rtl" style="direction:rtl;text-align:right;">
يجب أن يكون لديك الآن مجلد يسمى *.env* في المجلد الفارغ الخاص بك:
</div>

```
ls -a
```

```out
. .. .env
```

<div dir="rtl" style="direction:rtl;text-align:right;">
يمكنك الدخول والخروج من بيئتك الافتراضية باستخدام أوامر "التنشيط" و "إلغاء التنشيط":
</div>

```
# Activate the virtual environment
source .env/bin/activate

# Deactivate the virtual environment
deactivate
```

<div dir="rtl" style="direction:rtl;text-align:right;">
يمكنك التأكد من تنشيط البيئة عن طريق تشغيل الأمر `which python`: إذا كان يشير إلى البيئة الافتراضية، فقد قمت بتنشيطها بنجاح!
</div>

```
which python
```

```out
/home/<user>/transformers-course/.env/bin/python
```

<div dir="rtl" style="direction:rtl;text-align:right;">

### تثبيت التبعيات

كما في القسم السابق حول استخدام مثيلات Google Colab، ستحتاج الآن إلى تثبيت الحزم المطلوبة للمتابعة. مرة أخرى، يمكنك تثبيت إصدار التطوير من 🤗 Transformers باستخدام مدير الحزم `pip`:
</div>

```
pip install "transformers[sentencepiece]"
```

<div dir="rtl" style="direction:rtl;text-align:right;">
أنت الآن جاهز تمامًا للانطلاق!
</div>
