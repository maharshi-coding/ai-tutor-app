# OrderedDict in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/ordereddict-in-python/
Original Path: https://www.geeksforgeeks.org/python/ordereddict-in-python/
Course: Python Programming

OrderedDict in Python

Last Updated : 19 Sep, 2025

OrderedDict is a subclass of Python’s built-in dictionary dict that remembers the order in which keys are inserted.

- In older versions of Python (before 3.7), normal dictionaries did not guarantee order.

- With OrderedDict, you can rely on consistent insertion order across all Python versions and it is still relevant due to the following mentioned reasons.

It provides extra powerful features, such as:

- Reordering keys dynamically with move_to_end() (useful for FIFO/LIFO access).

- Popping items from either end with popitem(last=True/False).

- Order-sensitive equality checks (two OrderedDicts with same items but different order are not equal).

- Easy implementation of data structures like queues, stacks, or LRU caches.

Basic Example

This example shows how to create an OrderedDict, insert items and verify that it preserves insertion order.

Python

from collections import OrderedDict

od = OrderedDict ()
od [ 'apple' ] = 1
od [ 'banana' ] = 2
od [ 'cherry' ] = 3

print ( list ( od . items ()))

Output
[('apple', 1), ('banana', 2), ('cherry', 3)]

Explanation:

- We create an OrderedDict and insert three keys: 'apple', 'banana', and 'cherry'.

- When printed, the items appear in the exact order they were inserted.

OrderedDict vs dict

Before diving into examples, let’s understand how OrderedDict differs from a normal dict:

- Both preserve insertion order (from Python 3.7+).

- But only OrderedDict gives advanced control over order.

Example: This example compares dict and OrderedDict.

Python

from collections import OrderedDict

print ( "dict" )
d = {}
d [ 'a' ] = 1
d [ 'b' ] = 2
d [ 'c' ] = 3
d [ 'd' ] = 4
for key , val in d . items ():
print ( key , val )

print ( "ordered dict" )
od = OrderedDict ()
od [ 'd' ] = 4
od [ 'b' ] = 2
od [ 'a' ] = 1
od [ 'c' ] = 3
for key , val in od . items ():
print ( key , val )

Output
dict
a 1
b 2
c 3
d 4
ordered dict
d 4
b 2
a 1
c 3

Explanation:

- First part creates a regular dictionary d , adds keys in order and prints them, showing insertion order .

- Second part creates an OrderedDict od with keys added in a different order and prints them, preserving that order exactly.

Key Features of OrderedDict

Now let’s go through the most useful features of OrderedDict with examples.

1. Insertion order preservation

OrderedDict maintains the sequence exactly as elements were added. This is particularly useful in applications such as JSON serialization, form field processing or displaying logs, where the order of items carries semantic meaning.

Example: This example shows that OrderedDict preserves the sequence of items as they were added.

Python

from collections import OrderedDict

d = { 'a' : 1 , 'b' : 2 , 'c' : 3 }
for k , v in d . items ():
print ( k , v )

print ( "OrderedDict:" )
od = OrderedDict ([( 'd' , 4 ), ( 'b' , 2 ), ( 'a' , 1 ), ( 'c' , 3 )])
for k , v in od . items ():
print ( k , v )

Output
a 1
b 2
c 3
OrderedDict:
d 4
b 2
a 1
c 3

Explanation: This code creates a regular dictionary d and prints its items in insertion order. Then, it creates an OrderedDict od with keys in a different order and prints them, showing how OrderedDict preserves the exact insertion sequence.

2. Changing value does not affect order

In an OrderedDict, modifying the value of an existing key does not change its position in the order. This means you can update the values without affecting the original key order.

Example: This example shows that updating values does not move keys from their original position.

Python

from collections import OrderedDict

od = OrderedDict ([( 'a' , 1 ), ( 'b' , 2 ), ( 'c' , 3 ), ( 'd' , 4 )])
od [ 'c' ] = 5

for k , v in od . items ():
print ( k , v )

Output
a 1
b 2
c 5
d 4

Explanation: This code creates an OrderedDict od with keys 'a', 'b', 'c', and 'd'. It then updates the value of the key 'c' to 5. When printing, the keys remain in their original order, showing that changing a value does not affect the key order in an OrderedDict.

3. Equality checks consider order

Unlike regular dicts, OrderedDict checks both content and order for equality, so differing orders make them unequal. This is useful when order matters.

Example: This example shows that two OrderedDicts with the same content but different order are not equal.

Python

from collections import OrderedDict

od1 = OrderedDict ([( 'a' , 1 ), ( 'b' , 2 ), ( 'c' , 3 )])
od2 = OrderedDict ([( 'c' , 3 ), ( 'b' , 2 ), ( 'a' , 1 )])
print ( od1 == od2 )

Output
False

Explanation: This code creates two OrderedDicts od1 and od2 , with the same keys and values but in different orders. When comparing them, the result is False because OrderedDicts consider both the content and the order of keys for equality.

4. Reversing an OrderedDict

OrderedDict doesn’t have a built-in .reverse() method, but you can reverse its order by using Python’s reversed() function on list(od.items()). Creating a new OrderedDict from this reversed list preserves the reversed order.

Example: This example shows how to reverse an OrderedDict using reversed().

Python

from collections import OrderedDict

d1 = OrderedDict ([( 'a' , 1 ), ( 'b' , 2 ), ( 'c' , 3 )])
d2 = OrderedDict ( reversed ( list ( d1 . items ())))

for k , v in d2 . items ():
print ( k , v )

Output
c 3
b 2
a 1

Explanation: This code creates an OrderedDict d1 with keys 'a', 'b', and 'c'. It then reverses the order of d1’s items using reversed() and creates a new OrderedDict d2 with this reversed order.

5. Pop last or first item

In OrderedDict, popitem() can remove either the last item (last=True, default) or the first item (last=False). In contrast, a normal dict’s popitem() always removes the last item only.

Example: This example shows how popitem() can remove items from the last or the first.

Python

from collections import OrderedDict
d = OrderedDict ([( 'a' , 1 ), ( 'b' , 2 ), ( 'c' , 3 )])

res = d . popitem ( last = True ) # Remove last inserted item
print ( res )

Output
('c', 3)

Explanation: This code removes and returns the last item ('c', 3) from the OrderedDict using popitem(last=True) .

6. Move keys to front or end

With the move_to_end() method, OrderedDict provides the flexibility to reposition keys. You can push a specific key to the beginning or end of the dictionary without deleting and re-inserting it.

Example: This example shows how move_to_end() can move keys to the front or back.

Python

from collections import OrderedDict
d = OrderedDict ([( 'a' , 1 ), ( 'b' , 2 ), ( 'c' , 3 )])

d . move_to_end ( 'a' ) # Move 'a' to end
d . move_to_end ( 'b' , last = False ) # Move 'b' to front

for k , v in d . items ():
print ( k , v )

Output
b 2
c 3
a 1

Explanation: This code moves the key 'a' to the end of the OrderedDict and moves 'b' to the front. When printed, the keys appear in the order: 'b', 'c', 'a'.

7. Deleting and re-inserting keys

Deleting and re-inserting a key in an OrderedDict moves it to the end, preserving insertion order. This is useful for tracking recent actions or updating featured items.

Example: This example shows that when you delete and reinsert a key, it moves to the end.

Python

from collections import OrderedDict
od = OrderedDict ([( 'a' , 1 ), ( 'b' , 2 ), ( 'c' , 3 ), ( 'd' , 4 )])
od . pop ( 'c' ) # Delete 'c'

for k , v in od . items ():
print ( k , v )

od [ 'c' ] = 3 # Re-insert 'c' at end
for k , v in od . items ():
print ( k , v )

Output
a 1
b 2
d 4
a 1
b 2
d 4
c 3

Explanation: This code deletes the key 'c' from the OrderedDict, then prints the remaining items. After that, it re-inserts 'c' with its value at the end and prints all items again.

Now, let's see in brief the difference between OrderedDict and Dict to sum it up:

Feature

Dict

OrderedDict

Maintains insertion order

Yes

Allows key reordering

No

Yes (move_to_end(key, last=True))

Pop items from ends

No (only popitem() removes last item)

Yes (popitem(last=True/False) supports both ends)

Equality check considers order

No (order ignored)

Yes (order matters)

Performance

Faster

Slightly slower

Python

Python collections-module

Python Fundamentals

- Python Introduction 2 min read

- Input and Output in Python 4 min read

- Python Variables 4 min read

- Python Operators 4 min read

- Python Keywords 2 min read

- Python Data Types 8 min read

- Conditional Statements in Python 3 min read

- Loops in Python 5 min read

- Python Functions 5 min read

Python Data Structures

- Python String 5 min read

- Python Lists 4 min read

- Python Tuples 4 min read

- Python Dictionary 4 min read

- Python Sets 6 min read

- Python Arrays 7 min read

Advanced Python

- Python OOP Concepts 4 min read

- Python Exception Handling 5 min read

- File Handling in Python 4 min read

- Python Database Tutorial 4 min read

- Python MongoDB Tutorial 3 min read

- Python MySQL 9 min read

- Python Packages 10 min read

- Python Modules 3 min read

- Python DSA Libraries 5 min read

- List of Python GUI Library and Packages 3 min read

Data Science with Python

- NumPy Tutorial 3 min read

- Pandas Tutorial 4 min read

- Matplotlib Tutorial 3 min read

- Python Seaborn Tutorial 3 min read

- StatsModel Library - Tutorial 2 min read

- Learning Model Building in Scikit-learn 6 min read

- TensorFlow Tutorial 2 min read

- PyTorch Tutorial 5 min read

Web Development with Python

- Flask Tutorial 4 min read

- Django Tutorial | Learn Django Framework 6 min read

- Django ORM - Inserting, Updating & Deleting Data 4 min read

- Templating With Jinja2 in Flask 6 min read

- Django Templates 5 min read

- Build a REST API using Flask - Python 3 min read

- Building a Simple API with Django REST Framework 3 min read

Python Practice

- Python Quiz 1 min read

- Python Coding Practice 1 min read

- Python Interview Questions and Answers 15+ min read
