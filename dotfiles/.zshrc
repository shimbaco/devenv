export EDITOR=atom
export LANG=ja_JP.UTF-8
export LC_ALL='ja_JP.UTF-8' # aws s3 syncするときこれがないと死ぬ
export GOPATH=$HOME/dev/golang
export PATH=$PATH:~/bin:~/.rbenv/bin:/usr/local/bin:/usr/local/share/npm/bin:/usr/local/share/python:$GOPATH/bin:/usr/local/heroku/bin:/Applications/Postgres.app/Contents/Versions/9.3/bin

# rbenv
eval "$(rbenv init -)"

# nvm
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

# プロンプトの表示形式
# http://news.mynavi.jp/column/zsh/002/index.html
PROMPT="%m:%n$ "
RPROMPT="[%~]"
SPROMPT="correct: %R -> %r ? "

# AUTOJUMP
# https://github.com/joelthelion/autojump
#[[ -f ~/.autojump/etc/profile.d/autojump.zsh ]] && source ~/.autojump/etc/profile.d/autojump.zsh

# 補完機能の初期化
autoload -U compinit
compinit

# Viライクキーバインド設定
bindkey -v

# エイリアス
source "$HOME/.aliases"

# ディレクトリ名だけで cd する
setopt auto_cd

# cdで移動してもpushdと同じようにディレクトリスタックに追加する。
# (デフォルトでそういう動作になっているような)
#setopt auto_pushd

# ディレクトリが変わったらディレクトリスタックを表示
chpwd_functions=($chpwd_functions dirs)

# ヒストリを保存するファイル
HISTFILE=~/Dropbox/devenv/dotfiles/.zsh_history

# メモリ上のヒストリ数
# 大きな数を指定してすべてのヒストリを保存するようにしている
HISTSIZE=10000000

# 保存するヒストリ数
SAVEHIST=$HISTSIZE

# ヒストリファイルにコマンドラインだけではなく実行時刻と実行時間も保存する
setopt extended_history

# 同じコマンドラインを連続で実行した場合はヒストリに登録しない
setopt hist_ignore_dups

# スペースで始まるコマンドラインはヒストリに追加しない
setopt hist_ignore_space

# すぐにヒストリファイルに追記する
setopt inc_append_history

# zshプロセス間でヒストリを共有する
setopt share_history

# aws-cli
export AWS_CONFIG_FILE=~/.aws/config

# https://github.com/zimbatm/direnv
eval "$(direnv hook zsh)"

# zsh-completions
fpath=(/usr/local/share/zsh-completions $fpath)

# 便利関数を読み込む
for function in ~/.zsh/functions/*; do
  source $function
done
