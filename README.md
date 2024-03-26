# Foundry Metres, Grams and Litres

Foundry-MGL is intended to be the ultimate tool for playing dnd5e in the metric system.
The core concept behind Foundry-MGL is the idea of expandability this is why it is able to convert all types of text and labels that are found on the dnd5e system.

## Installation
To install the module, you can use the following manifest URL: `https://github.com/willumz/foundry-mgl/releases/latest/download/module.json`

## Tools
 The conversion tools offered by this module can be split into 2:
  - *simple conversion*: simple conversion can be done to all the different types of entities. It converts a single entity at a time and the operation can be redone at any time
  - *batch conversion*: batch conversion is a more intensive process that I recommend being done once. It is able to convert all the entities from a tab at once.
 ### Examples
   - simple conversion on an actor
   
   ![img](https://i.imgur.com/eWqfvRe.gif)

 ### Works for:
  scenes:
  
         -> creating a new scene will automatically use metric grid distance 
         
         -> batch conversion for existing scenes (except the one that is in view at the moment)
         
  actors:
   
        -> simple conversion for all the data on the actor (movement, senses, biography, items/spells/features)
  
        -> batch conversion for all the actors in the actors directory
         
  items: 
  
        -> simple conversion for items text descriptions, labels and templates
  
        -> batch conversion for all the items in the directory
        
  journal entries: 
  
          -> simple conversion for all the text 
  
          -> batch conversion for all the journal entries
                  
          Note: if you batch convert all the actors and the items then all the links will be to the metric version of them
                  
  rollable tables:
  
        -> simple conversion for the text 
  
        -> batch conversion for all the rolltables in the directory
             
  compendiums:
  
        -> simple conversion creates a new copy of the target compendium that has all it's entries in metric
  
        -> batch conversion will update all the compendiums and will recreate the links to items that are not in the metric system
              
        Note: all work on compendiums takes a while try do to it as less as possible
        
  ### First time setup
  
  Just started a new world and want it to be in the metric system from the start? No problem. 
  Before doing anything activate the module and start a batch conversion of the compendiums. 
  After it is done just use the compendiums that have the keyword "Metrified" in the name, and you are fine. If you want to later import something that uses imperial units you can safely metrify only the new parts.
  
  ### Converting an existing world?
  
  This is still simple but please **BACK UP YOUR WORLD BEFORE DOING ANY OF THIS I AM NOT RESPONSIBLE FOR ANYTHING THAT MIGHT BREAK**.
  
  Now that your backup is done start batch converting everything. 
  
  I have found that it works the best if you batch convert everything and leave the journal entries for last.
 
  After all the tabs are batch converted you should be fine but take a good look at everything so that you are sure it all worked.
  
  ## Don't like my conversion rates?
  
  No problem, all the conversions done in this module are based on multipliers that can be modified in the settings.
  
  At the moment I am converting:
   - inches to centimetres (the default rate is 1 inch = 2.5 cm)
   - feet to metres (the default rate is 1 feet = 0.3 m)
   - miles to kilometres (the default rate is 1 mile = 1.6 km)
   - pounds to kilograms (the default rate is 1 pound = 0.5 kg)
   
   ## Expanding to other systems?
   
   I am not familiar with any of the other systems, but the way I have designed this module it can be expanded to support the other systems.
   It is designed with a conversion engine that exports a lot of useful methods to convert the data, but adapting the conversion to the object structure of other system is up to anyone that wants to do it.  
   
   ## Compatibility with custom NPC/player sheets
   
   This module should be compatible with any NPC or actor sheet. 
   The ones I personally use are Zeel's Monsterblocks (as can be seen in the gifs) and ElfFriend's Compact DnDBeyond 5e Sheet and they work fine. 
