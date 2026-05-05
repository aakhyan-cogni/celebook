# EMS

## To Contribute follow the steps:

1. Checkout main branch
2. Pull the latest code
3. Checkout to a new branch named on what you are working on
4. Write your code and commit
5. Push your branch
6. Create a pull request on [GitHub](https://github.com/aakhyan-cogni/ems/compare);

## How to update your local branch with upstream main

1. Commit all your changes into **your branch**
2. Switch to main branch
3. Pull from remote (update latest code)
4. Switch to **your branch**
5. Rebase
6. Force push your branch

### Example

Let's say you are working on a branch called `feature_x` and want to update it with main code.

Assuming you are on your feature branch currently.

```bash
git add .
git commit -m "working on my feature"
git switch main
git pull
git switch feature_x
git rebase main
# assuming there were no errors (Read Carefully)
git push -f # please don't do this yourself if you're unsure
```
