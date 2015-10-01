require 'rails_helper'

context "As a teacher I want to add assignments to a course", js: true do

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
    @assignments_initially = @course.assignments.length
  end

  Steps "Adding assignmentss to a course" do

    Given "I visit the course edit page" do
      visit_course_edit_page
    end

    And "Add a assignment to a course" do
      add_a_assignment
    end

    Then "the assignment will be shown in assignments" do
      find_assignment_from_assignmentview
    end

    And "a new assignment is added to database" do
      check_if_assignment_is_added_to_database
    end
  end
end

def find_assignment_from_assignmentview
  expect(find('#assignmentView')).to have_content('Id: 7, Number: 6')
end

def check_if_assignment_is_added_to_database
  expect(Course.first.assignments.length).to be(@assignments_initially + 1)
end

def add_a_assignment
  expect(find('#assignmentView')).not_to have_content('Id: 7, Number: 6')
  click_button 'Add a new assignment'
end

def visit_course_edit_page
  visit '/'
  click_button 'Edit course'
end

def course_details
  @course = FactoryGirl.create :course
  course2 = FactoryGirl.create :course
  course2.assignments << (FactoryGirl.create :assignment)

  @jamppa = FactoryGirl.create :user, firstName: "Testi", lastName: "Jamppa"

  @task1 = FactoryGirl.create :assignment, number: 1
  @task2 = FactoryGirl.create :assignment, number: 2
  @task3 = FactoryGirl.create :assignment, number: 3

  @task1.location = FactoryGirl.create :location, x: 100, y: 200
  @task2.location = FactoryGirl.create :location, x: 360, y: 180
  @task3.location = FactoryGirl.create :location, x: 580, y: 190

  @course.assignments << @task1
  @course.assignments << @task2
  @course.assignments << @task3
end