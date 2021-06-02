begin
  require 'awesome_print' 
  # https://github.com/pry/pry/wiki/FAQ#wiki-awesome_print
  #Pry.config.print = proc { |output, value| Pry::Helpers::BaseHelpers.stagger_output("=> #{value.ai}", output) }
  
  # https://github.com/awesome-print/awesome_print/tree/4564fd74721562cbef2443f7d97109bf9192343d#pry-integration
  AwesomePrint.pry!
rescue LoadError => err
  puts "no awesome_print :("
end

Pry.config.editor = "vim"
Pry.commands.alias_command 'q', 'quit'

if defined?(PryDebugger)
  Pry.commands.alias_command 'c', 'continue'
  Pry.commands.alias_command 'f', 'finish'
  Pry.commands.alias_command 'n', 'next'
  Pry.commands.alias_command 's', 'step'
end
