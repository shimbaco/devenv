" viの互換モードをオフにする
set nocompatible

" 各プラグイン内のftdetectディレクトリ内のファイルを読み込ませるには
" pathogen.vimのcall pathogen#runtime_append_all_bundles()を呼び出す前に
" filetypeをoffにしておかないといけないらしい
"filetype off

" pathogen.vim
" filetype plugin indent onよりも前に読み込ませる必要があるらしい
"call pathogen#runtime_append_all_bundles()

set encoding=utf8

" 構文ごとに色を変える
syntax on

" 新しい行のインデントを現在行と同じにする
set autoindent

" 自動インデントの各段階に使われる空白の数
set shiftwidth=2

" 行頭の余白内で Tab を打ち込むと、'shiftwidth' の数だけインデントする。
set smarttab

" 新しい行を作ったときに高度な自動インデントを行う
set smartindent

" ペースト時 の vim のオートインデントを無効にする
" (iTerm2上でVimを動かしたとき、これが有効になってるとneocomplcacheが動かない)
set paste

" タブの代わりに空白文字を挿入する
set expandtab

" ファイル内のタブが対応する空白の数
set tabstop=2

" tabstopを変えずに空白を含めることにより、見た目のtabstopを変える
" set softtabstop=2

" 変更中のファイルでも、保存しないで他のファイルを表示
set hidden

" 他でファイルが編集された時に自動で読み込む
set autoread

" ファイルを上書きする前にバックアップを作る
" 書き込みが成功してもバックアップはそのまま取っておく。（有効:backup/無効:nobackup）
set nobackup

" ファイルの上書きの前にバックアップを作る。オプション 'backup' がオンでない限り、
" バックアップは上書きに成功した後削除される。（有効:writebackup/無効:nowritebackup）
set nowritebackup

" スワップファイルを作成しない
set noswapfile

" 検索がファイル末尾まで進んだら、ファイル先頭から再び検索する。
" （有効:wrapscan/無効:nowrapscan）
set wrapscan

" 検索時に大文字を含んでいたら大/小を区別
set smartcase

" インクリメンタルサーチを行う
set incsearch

" Escの2回押しでハイライト消去
nmap <ESC><ESC> ;nohlsearch<CR><ESC>


" 行番号を表示する
set number

" ルーラーを表示
set ruler

" 水平分割したとき下に新規ウィンドウを追加する
set splitbelow

" 垂直分割したとき右に新規ウィンドウを追加する
"set splitright


" Macのoptionキーをマッピングキーとして使用できるようにする
"set macmeta


" ノーマルモードではカーソルをBoxタイプに
" 挿入モードではVertical Barにする (iTerm2用の設定)
" https://groups.google.com/forum/#!topic/iterm2-discuss/1iZxfgipt4c
"let &t_SI = "\<Esc>]50;CursorShape=1\x7"
"let &t_EI = "\<Esc>]50;CursorShape=0\x7"

" set for 256 color schemes
" http://kevin.colyar.net/2011/01/pretty-vim-color-schemes-in-iterm2/
" set t_Co=256

"set background=light
"colorscheme solarized


" 閉じ括弧が入力されたとき、対応する括弧を表示する
set showmatch

" カーソルを行頭、行末で止まらないようにする
set whichwrap=b,s,h,l,<,>,[,]

" オンのとき、コマンドライン補完が拡張モードで行われる。
" （有効:wildmenu/無効:nowildmenu）
set wildmenu

" 行を折り返さす (有効:wrap/無効:nowrap)
set nowrap

" colorcolumn(エディタに縦線を引く機能)をデフォルトで無効化
"autocmd FileType * setlocal colorcolumn=0

" ClojureScriptのファイルをClojureのファイルとして開く
au! BufRead,BufNewFile *.cljs setfiletype clojure

" Slimのファイルにシンタックスハイライトとかを施す (vim-slim)
au! BufRead,BufNewFile *.slim setfiletype slim

" Ruby
autocmd FileType ruby setlocal colorcolumn=80

" JavaScript
"autocmd FileType javascript setlocal shiftwidth=2 tabstop=2 colorcolumn=80
autocmd FileType javascript setlocal shiftwidth=2 tabstop=2

" Python
"autocmd FileType python setlocal shiftwidth=4 tabstop=4 colorcolumn=79
autocmd FileType python setlocal shiftwidth=4 tabstop=4

" コッカなどが打たれたら左にポインタをシフトする
inoremap {} {}<Left>
inoremap [] []<Left>
inoremap () ()<Left>
inoremap "" ""<Left>
inoremap '' ''<Left>
inoremap <> <><Left>
imap %% %%<Left>

" ;と:を入れ替える
noremap ; :
noremap : ;

" CTRL-hjklでウィンドウ移動
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l
nnoremap <C-h> <C-w>h

" option+[で前のバッファへ
map <M-[> <ESC>;bp<CR>

" option+]で次のバッファへ
map <M-]> <ESC>;bn<CR>

" option+deleteでバッファを削除する
map <M-Backspace> <ESC>;bnext \| bdelete #<CR>

" command+shift+fでAckで検索する
map <D-F> <ESC>;Ack

" jjで:w
noremap jj <Esc>:w<CR>


" プラグイン
" ======================================================================

" JSON.vim
" http://www.vim.org/scripts/script.php?script_id=1945
" -------------------------------------------------------
au! BufRead,BufNewFile *.json setfiletype json


" neocomplete.vim
" -------------------------------------------------------
let g:neocomplete#enable_at_startup = 1
let g:neocomplete#enable_smart_case = 1


" unite.vim
" Prefix-key (http://vim-users.jp/2009/08/hack-59/)
" -------------------------------------------------------
nnoremap [unite] <Nop>
nmap f [unite]

nnoremap [unite]u :<C-u>Unite<Space>
nnoremap <silent> [unite]b :<C-u>Unite buffer<CR>
nnoremap <silent> [unite]m :<C-u>Unite file_mru<CR>
" TextMateの command + t 相当
nnoremap <silent> [unite]t :<C-u>Unite file_rec -start-insert<CR>

" 大文字小文字を区別しない
let g:unite_enable_ignore_case = 1
let g:unite_enable_smart_case = 1

" grep検索
nnoremap <silent> ,g  :<C-u>Unite grep -buffer-name=search-buffer<CR>

" grep検索結果の再呼出
nnoremap <silent> ,r  :<C-u>UniteResume search-buffer<CR>

" unite grep に ag(The Silver Searcher) を使う
if executable('ag')
  let g:unite_source_grep_command = 'ag'
  let g:unite_source_grep_default_opts = '--nogroup --nocolor --column'
  let g:unite_source_grep_recursive_opt = ''
endif


" NERD tree
" -------------------------------------------------------
" 指定したファイルを非表示にする
let NERDTreeIgnore=['\~$', '\.pyc$', '\.pyo$', '\.class$', '\.DS_Store$']
" デフォルトで非表示ファイルを表示する
let NERDTreeShowHidden=1
" 横幅のサイズを変更する
let NERDTreeWinSize=50

nnoremap [nerd] <Nop>
nmap n [nerd]
nnoremap <silent> [nerd]n :<C-u>NERDTreeToggle<CR>
nnoremap <silent> [nerd]s :<C-u>NERDTree<Space>


" taglist.vim
" -------------------------------------------------------
" 編集中のファイルのタグのみ表示
let Tlist_Show_One_File = 1
" 自動表示
"let Tlist_Auto_Open = 1

nnoremap tl :<C-u>Tlist<CR>


" vim-tags
" -------------------------------------------------------

"let g:vim_tags_project_tags_command = "/usr/local/Cellar/ctags/5.8/bin/ctags -R {OPTIONS} {DIRECTORY} 2>/dev/null"
"let g:vim_tags_gems_tags_command = "/usr/local/Cellar/ctags/5.8/bin/ctags -R {OPTIONS} `bundle show --paths` 2>/dev/null"


" NeoBundle
" -------------------------------------------------------
if has('vim_starting')
  set runtimepath+=~/.vim/bundle/neobundle.vim/
endif

call neobundle#begin(expand('~/.vim/bundle/'))

" Let NeoBundle manage NeoBundle
NeoBundleFetch 'Shougo/neobundle.vim'

NeoBundle 'mileszs/ack.vim'
NeoBundle 'mattn/emmet-vim'
NeoBundle 'nono/vim-handlebars'
NeoBundle 'jonathanfilip/vim-lucius'
NeoBundle 'Shougo/neocomplete.vim'
NeoBundle 'Shougo/neomru.vim'
NeoBundle 'scrooloose/nerdcommenter'
NeoBundle 'scrooloose/nerdtree'
NeoBundle 'taglist.vim'
NeoBundle 'Shougo/unite.vim'
NeoBundle 'bling/vim-airline'
NeoBundle 'kchmck/vim-coffee-script'
NeoBundle 'altercation/vim-colors-solarized'
NeoBundle 'tpope/vim-fugitive'
NeoBundle 'digitaltoad/vim-jade'
NeoBundle 'tpope/vim-markdown'
NeoBundle 'tpope/vim-rails'
NeoBundle 'slim-template/vim-slim'
NeoBundle 'wavded/vim-stylus'
NeoBundle 'szw/vim-tags'
NeoBundle 'Shougo/vimfiler'
NeoBundle 'Shougo/vimshell'
NeoBundle 'gmarik/vundle'

NeoBundle 'Shougo/vimproc.vim', {
\ 'build' : {
\     'mac' : 'make -f make_mac.mak',
\     'linux' : 'make',
\     'unix' : 'gmake'
\    }
\ }

call neobundle#end()

" 編集するファイルの種類を自動判別し、それに応じた便利な設定やインデントが行われるようにする
filetype plugin indent on

" If there are uninstalled bundles found on startup,
" this will conveniently prompt you to install them.
NeoBundleCheck
