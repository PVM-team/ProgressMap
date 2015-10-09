
require 'rails_helper'

describe "Action map page", js: true do

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

  	describe "when actionmap page is opened", js: true do

  		before :each do
  			course_details
            visit_map_page
  			visit_action_map_page
  		end

  		it "has a canvas" do
  			canvas = page.find("canvas")
  			expect(canvas.visible?).to be(true)
  		end

  		it "has buttons for each assignment" do
  			@course.assignments.each do |assignment|
  				button = page.first("button", :text => assignment.number)
  				expect(button.visible?).to be(true)
  			end
  		end

  		it "has one button for each assignment" do
  			@course.assignments.each do |assignment|
  				expect(page.find('#actionMapElements').find(".action-button", :text => assignment.number))
  			end
  		end

  		# button[:class] --> button undone-task ng-binding

  		it "the positions of the assignment buttons are determined by their location" do
  			@course.assignments.each do |assignment|
  				button = page.first(".action-button", :text => assignment.number)
  				style = button[:style]
  				expect(style).to have_content("top: " + (assignment.location.y - 25).to_s + "px")
  				expect(style).to have_content("left: " + (assignment.location.x - 25).to_s + "px")
            end
  		end

        it 'finds one student-button' do
            expect(page.first('.student-button'))   
        end
    end
end

def visit_map_page
	visit '/'
end

def visit_action_map_page

 click_button 'Go to action map'
end

def course_details
	@course = FactoryGirl.create :course
	course2 = FactoryGirl.create :course
	course2.assignments << (FactoryGirl.create :assignment)

	@user1 = FactoryGirl.create :user
	@user2 = FactoryGirl.create :user
	@user3 = FactoryGirl.create :user

	@task1 = FactoryGirl.create :assignment, number: 1
	@task2 = FactoryGirl.create :assignment, number: 2
	@task3 = FactoryGirl.create :assignment, number: 3
	@task4 = FactoryGirl.create :assignment, number: 4
	@task5 = FactoryGirl.create :assignment, number: 5

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

	@user3.assignments << course2.assignments[0]
end
