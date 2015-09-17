require 'rails_helper'

describe "Course map page", js: true do

	before :all do
		self.use_transactional_fixtures = false
	end

	before :each do
    	DatabaseCleaner.strategy = :truncation
    	DatabaseCleaner.start
	end

  	after :each do
    	DatabaseCleaner.clean
  	end

  	after :all do
    	self.use_transactional_fixtures = true
  	end

  	describe "when map page is opened", js: true do

  		before :each do
  			course_details
  			visit_map_page
  		end

  		it "has a canvas" do
  			expect(page.find("canvas")).not_to be(nil)
  		end

  		it "has buttons for each assignment" do
  			@course.assignments.each do |assignment|
  				button = page.first("button", :text => assignment.id)
  			end
  		end

  	#	it "has only one button for each assignment" do
  	#		@course.assignments.each do |assignment|
  	#			expect(page.find("button", :text => assignment.id))
  	#		end
  	#	end


  		# button[:class] --> button undone-task ng-binding

  		it "the positions of the buttons are determined by their location" do
  			@course.assignments.each do |assignment|
  				button = page.first("button", :text => assignment.id)
  				style = button[:style]

  				expect(style).to have_content("top: " + (assignment.location.y - 25).to_s + "px")
  				expect(style).to have_content("left: " + (assignment.location.x - 25).to_s + "px")
  			end
  		end
  	end
end

def course_details
	@course = FactoryGirl.create :course

	@user1 = FactoryGirl.create :user
	@user2 = FactoryGirl.create :user
	@user3 = FactoryGirl.create :user

	@task1 = FactoryGirl.create :assignment
	@task2 = FactoryGirl.create :assignment
	@task3 = FactoryGirl.create :assignment
	@task4 = FactoryGirl.create :assignment
	@task5 = FactoryGirl.create :assignment

	@task1.location = FactoryGirl.create :location, x: 100, y: 200
	@task2.location = FactoryGirl.create :location, x: 360, y: 180
	@task3.location = FactoryGirl.create :location, x: 580, y: 190
	@task4.location = FactoryGirl.create :location, x: 630, y: 410
	@task5.location = FactoryGirl.create :location, x: 420, y: 390

	@course.participants << @user1
	@course.participants << @user2
	@course.participants << @user3

	@course.assignments << @task1
	@course.assignments << @task2
	@course.assignments << @task3
	@course.assignments << @task4
	@course.assignments << @task5

	@user1.assignments << @task1
	@user1.assignments << @task2

	@user2.assignments << @task1
	@user2.assignments << @task3
	@user2.assignments << @task4
	@user2.assignments << @task5
end

def visit_map_page
	visit '/'
end