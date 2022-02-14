# Tree Visualization

## Outline the Story

## Identify Visual Encodings

## Provide a Rationale

I propose a visualization of tree growth over time. On the x axis, we see the
age of the tree (by plant date) and on the y axis, we have the tree's DBH
(diameter at breast height).

The first obvious issue that we encounter is that there is a lot of missing date
entries. As many as 27.7 thousand out of 37 thousand have no date entry
whatsoever. Initially, I tried assigning all of these a dummy entry, so that
they would still appear on my plot, but it immediately became clear that they
would have be included separately, as they were impossible to ignore and drew
attention away from the meaningful data points. Instead, I chose to omit these
from the primary scatterplot figure, with the intent of examining them further
through some other visualization.

Without those points, though, I found that the plot was still very visually
noisy, and while the underlying growth trend was present, it was neither obvious
nor the most visually striking part of the page.

I realize now I can take advantage of this and answer the questions that my
scatterplot prompts. Specifically, these are: what's up with all those really
big trees? and what about those really old trees?

Draw a dashed line across the plot at y=25cm
show some visual guides from the left to the right (is this possible?)
Explain the smoothing technique used on the right
