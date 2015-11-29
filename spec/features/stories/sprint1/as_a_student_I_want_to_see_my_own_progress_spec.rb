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

		Given "I visit the course map page as @student2" do
			visit_map_page
		end

		And "Canvas and buttons are rendered" do
  			canvas = page.find("canvas")
  			expect(canvas.visible?).to be(true)

  			@course.assignments.each do |assignment|

  				button = find_button(assignment.number)
  				expect(button.visible?).to be(true)
  			end
		end

		Then "I can see assignments I have completed" do
			check_that_student_sees_done_tasks_as_done(@course, @student2, 4)
		end

		And "I can see the assignments I have not completed yet" do
			check_that_student_sees_undone_tasks_as_undone(@course, @student2, 1)
		end
	end
end

def course_details
	@course = FactoryGirl.create :course
	course2 = FactoryGirl.create :course
	course2.assignments << (FactoryGirl.create :assignment, name: "tehtävä1", number: 1)

	@student1 = FactoryGirl.create :student
	@student2 = FactoryGirl.create :student
	@student3 = FactoryGirl.create :student

    @task1 = FactoryGirl.create :assignment, name: "tehtävä1", number: 1
    @task2 = FactoryGirl.create :assignment, name: "tehtävä2", number: 2
    @task3 = FactoryGirl.create :assignment, name: "tehtävä3", number: 3
    @task4 = FactoryGirl.create :assignment, name: "tehtävä4", number: 4
    @task5 = FactoryGirl.create :assignment, name: "tehtävä5", number: 5

	@task1.location = FactoryGirl.create :location, x: 100, y: 200
	@task2.location = FactoryGirl.create :location, x: 360, y: 180
	@task3.location = FactoryGirl.create :location, x: 580, y: 190
	@task4.location = FactoryGirl.create :location, x: 630, y: 410
	@task5.location = FactoryGirl.create :location, x: 420, y: 390

	@course.students << @student1
	@course.students << @student2
	@course.students << @student3

	@course.assignments << @task1
	@course.assignments << @task2
	@course.assignments << @task3
	@course.assignments << @task4
	@course.assignments << @task5

	@student1.assignments << @task1
	@student1.assignments << @task2

	@student2.assignments << @task1
	@student2.assignments << @task3
	@student2.assignments << @task4
	@student2.assignments << @task5

	@student3.assignments << course2.assignments[0]
end

def visit_map_page
    visit '#/map/1'
end

def check_that_student_sees_tasks_with_status_as_status(course, assignments, status, amount)
	index = 0

  	assignments.each do |assignment|

  		course.assignments.each do |course_assignment|
  			if course_assignment === assignment

  				button = find_button(assignment.number)

  				expect(button[:class]).to have_content(status)
  				index = index + 1
  			end
  		end
  	end
  	expect(index).to be(amount)
end

def check_that_student_sees_done_tasks_as_done(course, student, amount)
  	check_that_student_sees_tasks_with_status_as_status(course, student.assignments, "done-task", amount)
end

def check_that_student_sees_undone_tasks_as_undone(course, student, amount)
	undone_tasks = []

	course.assignments.each do |assignment|

		undone_tasks << assignment unless student_has_done_assignment(student, assignment)
	end

	check_that_student_sees_tasks_with_status_as_status(course, undone_tasks, "undone-task", amount)
end

def student_has_done_assignment(student, assignment)
	student.assignments.each do |a|

		return true if a === assignment
	end
	false
end
