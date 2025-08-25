#!/bin/bash

# GitHub Actions 权限检查脚本

echo "🔍 检查 GitHub Actions 权限..."

# 检查 GITHUB_TOKEN 是否存在
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN 未设置"
    exit 1
else
    echo "✅ GITHUB_TOKEN 已设置"
fi

# 检查 GitHub CLI 是否可用
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI 已安装"
    
    # 检查认证状态
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI 已认证"
    else
        echo "❌ GitHub CLI 未认证"
        exit 1
    fi
else
    echo "❌ GitHub CLI 未安装"
    exit 1
fi

# 检查仓库权限
echo "🔍 检查仓库权限..."
REPO_INFO=$(gh api repos/$GITHUB_REPOSITORY 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ 可以访问仓库信息"
    
    # 检查是否有写入权限
    PERMISSIONS=$(echo "$REPO_INFO" | jq -r '.permissions.admin // .permissions.push // false')
    if [ "$PERMISSIONS" = "true" ]; then
        echo "✅ 有仓库写入权限"
    else
        echo "❌ 没有仓库写入权限"
        exit 1
    fi
else
    echo "❌ 无法访问仓库信息"
    exit 1
fi

echo "✅ 权限检查通过" 