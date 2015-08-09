# devenv

## 事前準備

```
$ sudo easy_install pip
$ sudo pip install ansible
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```


## 使いかた

```
$ git clone git@github.com:shimbaco/devenv.git
$ cd devenv
$ ansible-playbook -i playbooks/hosts playbooks/site.yml -K
```
