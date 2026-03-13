# Decoder-Modelle

Source: Hugging Face Course
Original URL: https://github.com/huggingface/course/blob/HEAD/chapters/de/chapter1/6.mdx
Original Path: chapters/de/chapter1/6.mdx
Course: Artificial Intelligence

# Decoder-Modelle

<CourseFloatingBanner
chapter={1}
classNames="absolute z-10 right-0 top-0"
/>

<Youtube id="d_ixlCubqQw" />

Decoder-Modelle verwenden nur den Decoder eines Transformer-Modells. Die Attention-Layer können bei jedem Schritt hinsichtlich eines bestimmten Wortes nur auf die Wörter zugreifen, die vor diesem Wort im Satz stehen. Diese Modelle werden oft als *autoregressive Modelle* bezeichnet.

Beim Pretraining von Decoder-Modellen geht es in der Regel um die Vorhersage des nächsten Wortes im Satz.

Diese Modelle sind am besten für Aufgaben geeignet, bei denen es um die Generierung von Texten geht.

Zu dieser Modellfamilie gehören unter anderem:

- [CTRL](https://huggingface.co/transformers/model_doc/ctrl)
- [GPT](https://huggingface.co/docs/transformers/model_doc/openai-gpt)
- [GPT-2](https://huggingface.co/transformers/model_doc/gpt2)
- [Transformer XL](https://huggingface.co/transformers/model_doc/transformerxl)
