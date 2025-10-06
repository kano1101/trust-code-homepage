#!/bin/bash

# Readdy Theme 4 - Advanced Build Script
# 使い方: ./build.sh [オプション]

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ヘルプメッセージ
show_help() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}  Readdy Theme 4 - Advanced Build Script${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}使い方:${NC}"
    echo -e "  ./build.sh [オプション]"
    echo ""
    echo -e "${YELLOW}オプション:${NC}"
    echo -e "  ${GREEN}-h, --help${NC}          このヘルプメッセージを表示"
    echo -e "  ${GREEN}-b, --build${NC}         ビルドのみ実行"
    echo -e "  ${GREEN}-c, --copy${NC}          アセットのコピーのみ実行"
    echo -e "  ${GREEN}-w, --watch${NC}         開発モード（ウォッチ）を起動"
    echo -e "  ${GREEN}-p, --preview${NC}       プレビューサーバーを起動"
    echo -e "  ${GREEN}-i, --install${NC}       依存関係をインストール"
    echo -e "  ${GREEN}-cl, --clean${NC}        ビルド成果物をクリーンアップ"
    echo -e "  ${GREEN}-a, --all${NC}           フルビルド（クリーン + インストール + ビルド + コピー）"
    echo -e "  ${GREEN}-v, --version${NC}       バージョン情報を表示"
    echo ""
    echo -e "${YELLOW}例:${NC}"
    echo -e "  ./build.sh                    デフォルト（ビルド + コピー）"
    echo -e "  ./build.sh --watch            開発モードで起動"
    echo -e "  ./build.sh --all              フルビルド実行"
    echo -e "  ./build.sh -b -c              ビルドとコピーを実行"
    echo ""
}

# バージョン情報
show_version() {
    echo -e "${PURPLE}Readdy Theme 4${NC}"
    echo -e "Version: ${GREEN}4.0.0${NC}"
    echo -e "Build Script Version: ${GREEN}1.0.0${NC}"
}

# ビルド
build() {
    echo -e "${BLUE}▶ ビルド開始...${NC}"
    npm run build
    echo -e "${GREEN}✓ ビルド完了${NC}"
}

# アセットコピー
copy_assets() {
    echo -e "${BLUE}▶ アセットをコピー中...${NC}"
    npm run copy:assets
    echo -e "${GREEN}✓ アセットコピー完了${NC}"
}

# 開発モード
watch() {
    echo -e "${BLUE}▶ 開発モードを起動中...${NC}"
    npm run dev
}

# プレビュー
preview() {
    echo -e "${BLUE}▶ プレビューサーバーを起動中...${NC}"
    npm run preview
}

# 依存関係インストール
install() {
    echo -e "${BLUE}▶ 依存関係をインストール中...${NC}"
    npm install
    echo -e "${GREEN}✓ インストール完了${NC}"
}

# クリーンアップ
clean() {
    echo -e "${BLUE}▶ クリーンアップ中...${NC}"
    rm -rf out/
    rm -rf assets/*.js assets/*.css
    rm -f manifest.json
    echo -e "${GREEN}✓ クリーンアップ完了${NC}"
}

# フルビルド
full_build() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}  フルビルドを開始${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    clean
    install
    build
    copy_assets
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ フルビルド完了！${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# デフォルト動作
default_build() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}  Readdy Theme 4 ビルド${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    build
    copy_assets
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ ビルド完了！${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 引数がない場合はデフォルトビルド
if [ $# -eq 0 ]; then
    default_build
    exit 0
fi

# 引数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            show_version
            exit 0
            ;;
        -b|--build)
            build
            shift
            ;;
        -c|--copy)
            copy_assets
            shift
            ;;
        -w|--watch)
            watch
            shift
            ;;
        -p|--preview)
            preview
            shift
            ;;
        -i|--install)
            install
            shift
            ;;
        -cl|--clean)
            clean
            shift
            ;;
        -a|--all)
            full_build
            shift
            ;;
        *)
            echo -e "${RED}エラー: 不明なオプション: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
done