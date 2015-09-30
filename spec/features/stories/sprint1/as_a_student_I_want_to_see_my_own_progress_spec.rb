require 'rails_helper'

context "As a student I want to see my own progress", js: true do 

  before :all do
    self.use_transactional_fixtures = false
  end

  after :all do
  	self.use_transactional_fixtures = true
  end  	

	before :each do
  	DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.start
	 end

  after :each do
    DatabaseCleaner.clean
  end


	before :each do
		course_details
	end

	Steps "Visiting course map page" do

		Given "I visit the course map page as @user2" do
			visit_map_page
		end

		And "Canvas and buttons are rendered" do
  			canvas = page.find("canvas")
  			expect(canvas.visible?).to be(true)

  			@course.assignments.each do |assignment|

  				button = page.first("button", :text => assignment.number)
  				expect(button.visible?).to be(true)
  			end
		end

		Then "I can see assignments I have completed" do
			check_that_user_sees_done_tasks_as_done(@course, @user2, 4)
		end

		And "I can see the assignments I have not completed yet" do
			check_that_user_sees_undone_tasks_as_undone(@course, @user2, 1)
		end
	end
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

def visit_map_page
	visit '/'
end

def check_that_user_sees_tasks_with_status_as_status(course, assignments, status, amount)
	index = 0

  	assignments.each do |assignment|

  		course.assignments.each do |course_assignment|
  			if course_assignment === assignment

  				button = page.first("button", :text => assignment.number)
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