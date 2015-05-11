#!/usr/bin/env ruby

def run(command)
  puts command
  system command
end

run "sudo xcodebuild -license"
run "xcode-select --install"

run 'ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"'
run "brew update"

run "brew install python"
run "brew install ansible"
