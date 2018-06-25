export EDITOR=code
export LANG=ja_JP.UTF-8
export LC_ALL='ja_JP.UTF-8' # aws s3 syncするときこれがないと死ぬ
export LC_CTYPE='ja_JP.UTF-8' # rubocopで `invalid byte sequence in US-ASCII` というエラーが出ないようにする
export GOBIN=$PWD/bin
export GOPATH=$HOME/dev
export PATH=$PATH:$GOBIN
export PATH=$PATH:~/bin
export PATH=$PATH:~/.rbenv/bin
export PATH=$PATH:~/.yarn/bin
export PATH=$PATH:$GOPATH/bin
export PATH=$PATH:/usr/local/bin
export PATH=$PATH:/usr/local/share/npm/bin
export PATH=$PATH:/usr/local/heroku/bin
export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/9.3/bin
export PATH=$PATH:/usr/local/opt/mongodb@3.0/bin
export PATH=$PATH:/usr/local/opt/imagemagick@6/bin
export PATH=$PATH:/usr/local/opt/go@1.9/bin
export PATH=$PATH:/usr/local/Cellar/git/2.17.1/bin
export ENHANCD_FILTER=peco
# https://github.com/golang/go/issues/17182
export GOROOT_BOOTSTRAP=$GOROOT
export PKG_CONFIG_PATH=/usr/local/opt/imagemagick@6/lib/pkgconfig
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_172.jdk/Contents/Home

# rbenv
eval "$(rbenv init -)"

# nvm
export NVM_DIR="$HOME/.nvm"
. "/usr/local/opt/nvm/nvm.sh"

# プロンプトの表示形式
# http://news.mynavi.jp/column/zsh/002/index.html
PROMPT="%n@%* $ "
RPROMPT="[%~]"
SPROMPT="correct: %R -> %r ? "

# AUTOJUMP
# https://github.com/joelthelion/autojump
#[[ -f ~/.autojump/etc/profile.d/autojump.zsh ]] && source ~/.autojump/etc/profile.d/autojump.zsh

# 補完機能の初期化
autoload -Uz compinit
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

# enhancd
source ~/dev/src/github.com/b4b4r07/enhancd/init.sh

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/shimbaco/Dropbox/programming/google-cloud-sdk/path.zsh.inc' ]; then source '/Users/shimbaco/Dropbox/programming/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/Users/shimbaco/Dropbox/programming/google-cloud-sdk/completion.zsh.inc' ]; then source '/Users/shimbaco/Dropbox/programming/google-cloud-sdk/completion.zsh.inc'; fi

# asdf
. $HOME/.asdf/asdf.sh
. $HOME/.asdf/completions/asdf.bash
