# Experimenting with OpenAI GPT

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/5-NLP/20-LangModels/GPT-PyTorch.ipynb
Original Path: lessons/5-NLP/20-LangModels/GPT-PyTorch.ipynb
Course: Artificial Intelligence

## Experimenting with OpenAI GPT

This notebook is part of [AI for Beginners Curriculum](http://aka.ms/ai-beginners).

In this notebook, we will explore how we can play with OpenAI-GPT model using Hugging Face `transformers` library.

Without further ado, let's instantiate text generating pipeline and start generating!

```python
from transformers import pipeline

model_name = 'openai-gpt'

generator = pipeline('text-generation', model=model_name)

generator("Hello! I am a neural network, and I want to say that", max_length=100, num_return_sequences=5)
```

Output:
```text
c:\Users\bethanycheum\Desktop\AI-For-Beginners\.venv\lib\site-packages\tqdm\auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
from .autonotebook import tqdm as notebook_tqdm
Downloading model.safetensors: 100%|██████████| 479M/479M [04:28<00:00, 1.78MB/s]
c:\Users\bethanycheum\Desktop\AI-For-Beginners\.venv\lib\site-packages\huggingface_hub\file_download.py:133: UserWarning: `huggingface_hub` cache-system uses symlinks by default to efficiently store duplicated files but your machine does not support them in C:\Users\bethanycheum\.cache\huggingface\hub. Caching files will still work but in a degraded version that might require more space on your disk. This warning can be disabled by setting the `HF_HUB_DISABLE_SYMLINKS_WARNING` environment variable. For more details, see https://huggingface.co/docs/huggingface_hub/how-to-cache#limitations.
To support symlinks on Windows, you either need to activate Developer Mode or to run Python as an administrator. In order to see activate developer mode, see this article: https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development
warnings.warn(message)
Some weights of OpenAIGPTLMHeadModel were not initialized from the model checkpoint at openai-gpt and are newly initialized: ['position_ids']
You should probably TRAIN this model on a down-stream task to be able to use it for predictions and inference.
Downloading (…)neration_config.json: 100%|██████████| 74.0/74.0 [00:00<00:00, 48.8kB/s]
Downloading (…

[{'generated_text': "Hello! I am a neural network, and I want to say that i apologize for not coming to you yourself, for not helping you, and that i was too busy getting dressed and studying for a midterm. you know, the kind where the teachers are like that and they come in pairs with their boyfriends, but not with theirs. it's true, that i have had a girlfriend, and i'm only going on wednesdays and thursdays because i was too busy with college, but maybe"},
{'generated_text': 'Hello! I am a neural network, and I want to say that we have been blessed with a wonderful gift ; no one of us has died at all. and our spirits are strong, very strong. in one very lucky moment of luck for you, all has been given direction and destiny, and for us there are no more mysteries. the earth has been chosen for you, and that earth is now ours, and you must be forever in our hearts. " \n the words, as one,'},
{'generated_text': 'Hello! I am a neural network, and I want to say that if you would just turn and face the general, you would have a nice day. " \n " sure thing, " said one of the soldiers, and started to run. the rest of the soldiers followed, shouting. the general turned to general zulu, raising his arm. the general said something in his native language, and the general immediately started to run. zulu started to move toward the wall, with the'},
{'generated_text': 'Hello! I am a neural network, and I want to say that i am not a doctor but an anthropologist to you, a specialist, a specialist in the field of astrobiological biology, and that i am very much involved in this invest
```

## Prompt Engineering

In some of the problems, you can use openai-gpt generation right away by designing correct prompts. Have a look at the examples below:

```python
generator("Synonyms of a word cat:", max_length=20, num_return_sequences=5)
```

Output:
```text
[{'generated_text': 'Synonyms of a word cat: the same cat i used to stare at, and you in'},
{'generated_text': 'Synonyms of a word cat: cat of the woods, cat of the hills, cat of'},
{'generated_text': 'Synonyms of a word cat: you! \n " it\'s a girl. " i said'},
{'generated_text': "Synonyms of a word cat: big cat. but how come, we didn't hear it"},
{'generated_text': 'Synonyms of a word cat: " mea - o - c " which makes them sound'}]
```

```python
generator("I love when you say this -> Positive\nI have myself -> Negative\nThis is awful for you to say this ->", max_length=40, num_return_sequences=5)
```

Output:
```text
[{'generated_text': 'I love when you say this -> Positive\nI have myself -> Negative\nThis is awful for you to say this -> positive this is so horrible - > positive that your brother is gay - >'},
{'generated_text': 'I love when you say this -> Positive\nI have myself -> Negative\nThis is awful for you to say this -> negative i will bring this on you -, < positive am i, i'},
{'generated_text': 'I love when you say this -> Positive\nI have myself -> Negative\nThis is awful for you to say this -> negative i have self - esteem i must take it - : \n - -'},
{'generated_text': 'I love when you say this -> Positive\nI have myself -> Negative\nThis is awful for you to say this -> negative this is - : \n if it were true that the devil would have'},
{'generated_text': "I love when you say this -> Positive\nI have myself -> Negative\nThis is awful for you to say this -> positive i have you - > positive it's a bad thing, > positive"}]
```

```python
generator("Translate English to French: cat => chat, dog => chien, student => ", top_k=50, max_length=30, num_return_sequences=3)
```

Output:
```text
[{'generated_text': 'Translate English to French: cat => chat, dog => chien, student => new and unusual. there were no more words to be'},
{'generated_text': 'Translate English to French: cat => chat, dog => chien, student => student \n his eyes were huge in his lean face as'},
{'generated_text': "Translate English to French: cat => chat, dog => chien, student => the teacher's words, their words, their words."}]
```

```python
generator("People who liked the movie The Matrix also liked ", max_length=40, num_return_sequences=5)
```

Output:
```text
[{'generated_text': 'People who liked the movie The Matrix also liked it, and there was the movie of the first man after us. \n i wanted to laugh at how stupid these stupid actors were. no, they were'},
{'generated_text': "People who liked the movie The Matrix also liked the movie, and the film was the result. and that's when the man in the story was brought into reality, after a few decades. \n a"},
{'generated_text': 'People who liked the movie The Matrix also liked the movie the matrix, because there was a very old movie movie called the matrix, where there was a great super hero, and the super hero came out'},
{'generated_text': "People who liked the movie The Matrix also liked the movie that didn't have a chance to pay cash, if they could afford it. most often they got a good deal and a lot of money,"},
{'generated_text': "People who liked the movie The Matrix also liked the movie, and i didn't seem to have the same problem. \n i 'd met the other half of my family. i spent most of my time"}]
```

## Text Sampling Strategies

So far we have been using simple **greedy** sampling strategy, when we selected next word based on the highest probability. Here is how it works:

```python
prompt = "It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw"
generator(prompt,max_length=100,num_return_sequences=5)
```

Output:
```text
[{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw my friend, a young man, sprawled across the bed in his bed. \n " hi, i\'m mike eptirard. " \n there was silence on the other side of the door. i listened for any trace of life but there was nothing. my heart began to pound, i was starting to sweat, i took out my wallet'},
{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw my mother on the bed, hugging her legs to her chest and sobbing. i saw my dad and mother from the corner of my eye. \n elfin face was covered in tears as i entered the room. my dad and mother also wept ; just as they did every other time i came to work. but this time, they had different faces'},
{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw the room had changed because it was dark. it still smelled like a hospital. a new light shined through from a vent in the ceiling. i found myself in a bathroom and a small room with a sink and a wall of glass. the bathroom billion years ago. not so different from all of the rest of the apartment. \n now...'},
{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw a large woman with dark hair and pale skin. she was asleep, but i noticed a faint movement of her face.
```

**Beam Search** allows the generator to explore several directions (*beams*) of text generation, and select the ones with highers overall score. You can do beam search by providing `num_beams` parameter. You can also specify `no_repeat_ngram_size` to penalize the model for repeating n-grams of a given size:

```python
prompt = "It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw"
generator(prompt,max_length=100,num_return_sequences=5,num_beams=10,no_repeat_ngram_size=2)
```

Output:
```text
[{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw a man sitting in a chair with his head in his hands. he didn\'t look up as i approached. \n " excuse me, sir, " i said. " can i help you? " \n the man looked up at me. his eyes were red - rimmed and his face was pale, as if he hadn\'t slept in days'},
{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw a man sitting at a desk in the middle of the room. he had his back to me, so i couldn\'t see what he was doing. " \n " what did he look like? " i asked as i sat down on the bed next to her. \n she took a deep breath and looked at me with tears in her eyes'},
{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw a woman sitting on the bed, reading a book. she looked up at me and smiled. \n " hi, " she said. " can i help you? " \n i sat down next to her and looked around the room. the walls were white, and there was a large window in the middle of the wall that looked out on'},
{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw a man sitting at a table in the middle of the room. he looked up as i walked in, and when he saw me, he got up and walked over to me. \n " can i help you? " he asked as he put his hand on the small of my
```

**Sampling** selects the next word non-deterministically, using the probability distribution returned by the model. You turn on sampling using `do_sample=True` parameter. You can also specify `temperature`, to make the model more or less deterministic.

```python
prompt = "It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw"
generator(prompt,max_length=100,do_sample=True,temperature=0.8)
```

Output:
```text
[{'generated_text': 'It was early evening when I can back from work. I usually work late, but this time it was an exception. When I entered a room, I saw her. she was on the bed, but she looked very different. \n " honey, what\'s the matter? " i asked. \n she sat up. " i can\'t believe it\'s real. i\'ve been dreaming about you for the last two days. " \n " i can\'t believe it either. i guess that\'s how'}]
```

We can also provide to additional parameters to sampling:
* `top_k` specifies the number of word options to consider when using sampling. This minimizes the chance of getting weird (low-probability) words in our text.
* `top_p` is similar, but we chose the smallest subset of most probable words, whose total probability is larger than p.

Feel free to experiment with adding those parameters in.

## Fine-Tuning your models

You can also [fine-tune your model](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/fine-tuning?pivots=programming-language-studio?WT.mc_id=academic-77998-bethanycheum) on your own dataset. This will allow you to adjust the style of text, while keeping the major part of language model.
