#!/usr/bin/env ruby

require 'xcodeproj'

# Project location
project_path = 'TestApp/TestApp.xcodeproj'
project_name = 'TestApp'

# Creates project
project = Xcodeproj::Project.new(project_path)

# Creates main target
target = project.new_target(:application, project_name, :ios, '12.0')

# Creates main file
source_group = project.new_group('Sources')

# Creates an empty Swift file for the ViewController
view_controller_file = source_group.new_file('TestApp/ViewController.swift')

# Adds the source file to the target
target.add_file_references([view_controller_file])

# Adds a basic info.plist
info_plist_path = 'TestApp/Info.plist'
info_plist = project.new_file(info_plist_path)

# Sets up the project
project.main_group.new_file('TestApp/AppDelegate.swift')
project.main_group.new_file('TestApp/Info.plist')

# Saves the project
project.save

puts "Xcode project created at #{project_path}"
