# devenv

## 事前準備

```sh
$ sudo easy_install pip
$ sudo pip install ansible
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```


## 使いかた

```sh
$ git clone git@github.com:shimbaco/devenv.git
$ cd devenv
$ ansible-playbook -i playbooks/hosts playbooks/site.yml -K
```
