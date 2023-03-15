import random


def get_slices(lst):
    ret = []
    idxr = len(lst)//2
    for i in range(idxr):
        ret.append(tuple(lst[i::idxr]))
    return ret


def assign_prompt_combos(players):
    c = list(players)
    even = not (len(c) % 2)
    tups = []
    
    random.shuffle(c)
    if even:
        tups.extend(get_slices(c))
        random.shuffle(c)
        tups.extend(get_slices(c))
        return tups
    
    fixed = c.pop()
    last = c[-1]
    tups.append((fixed, last))
    tups.extend(get_slices(c))
    c.pop()
    c.append(fixed)
    random.shuffle(c)
    tups.extend(get_slices(c))
    return tups