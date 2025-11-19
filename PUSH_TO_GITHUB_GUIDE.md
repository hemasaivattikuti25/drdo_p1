# Guide to Fix Git Remote and Push to GitHub

## 1. Update the Remote URL
# Replace the incorrect remote URL with the correct one.
git remote set-url origin https://github.com/hemasai/FavCart---A-full-stack-e-commerce-website.git

## 2. Verify the Remote URL
# Confirm the updated remote URL.
git remote -v

## 3. Remove Unnecessary Remotes
# If an 'upstream' remote exists and is not needed, remove it.
git remote remove upstream

## 4. Prune Stale Remote-Tracking Branches
# Clean up local references to branches that no longer exist on the remote.
git remote prune origin

## 5. Fetch and Push Changes
# Fetch the latest changes and push your branch to the remote repository.
git fetch origin
git push origin Favcart
