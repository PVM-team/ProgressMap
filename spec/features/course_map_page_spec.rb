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

  		it "has only one button for each assignment" do
  			@course.assignments.each do |assignment|
  				expect(page.find("button", :text => assignment.id))
  			end
  		end


  		# button[:class] --> button undone-task ng-binding

  		it "the positions of the buttons are determined by their location" do
  			@course.assignments.each do |assignment|
  				button = page.first("button", :text => assignment.id)
  				style = button[:style]

  				expect(style).to have_content("top: " + (assignment.location.y - 25).to_s + "px")
  				expect(style).to have_content("left: " + (assignment.location.x - 25).to_s + "px")
  			end
  		end

  		describe "when current user is @user2" do

  			it "user can see 4 assignments marked as done" do
  				check_that_user_sees_done_tasks_as_done(@course, @user2, 4)
  			end

  			it "one of the assignments is marked as undone" do
  				check_that_user_sees_undone_tasks_as_undone(@course, @user2, 1)
  			end
  		end

  		#it "user can see, how many participants have completed each assignment" do
  		#
  		#end
  	end
end

def course_details
	@course = FactoryGirl.create :course
	course2 = FactoryGirl.create :course
	course2.assignments << (FactoryGirl.create :assignment)

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

	@user3.assignments << course2.assignments[0]
end

def visit_map_page
	visit '/'
end

def check_that_user_sees_tasks_with_status_as_status(course, assignments, status, amount)
	index = 0

  	assignments.each do |assignment|

  		course.assignments.each do |course_assignment|
  			if course_assignment === assignment

  				button = page.first("button", :text => assignment.id)
  				clas = button[:class]

  				expect(clas).to have_content(status)
  				index = index + 1
  			end
  		end
  	end
  	expect(index).to be(amount)
end

def check_that_user_sees_done_tasks_as_done(course, user, amount)
  	check_that_user_sees_tasks_with_status_as_status(course, user.assignments, "done-task", amount)
end

def check_that_user_sees_undone_tasks_as_undone(course, user, amount)
	undone_tasks = []

	course.assignments.each do |assignment|

		undone_tasks << assignment unless user_has_done_assignment(user, assignment)
	end

	check_that_user_sees_tasks_with_status_as_status(course, undone_tasks, "undone-task", amount)
end

def user_has_done_assignment(user, assignment)
	user.assignments.each do |a|

		return true if a === assignment
	end
	false
end