require 'rails_helper'

context "As a teacher I want to add students to a course", js: true do

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
    @participants_on_course = @course.participants.length
    @original_membership_count = Membership.count
  end

  Steps "Adding students to a course" do

    Given "I visit the course edit page" do
      visit_course_edit_page
    end

    And "Add a student to a course" do
      add_a_student
    end

    Then "the user won't be shown in resultview" do
      find_student_from_resultview
    end

    And "a new membership between that user and the edited course is created" do
      check_if_membership_is_created
    end

    When "Visit course map page" do
      visit_map_page
    end

    Then "I can see the student at map page as participant" do
      page_contains_participants
    end
  end
end

  def find_student_from_resultview
    expect(page.find("#resultview").text).to be_empty
  end

  def check_if_membership_is_created
    expect(Membership.count).to be(@original_membership_count + 1)
    course = Course.first
    expect(course.participants.length).to be(@participants_on_course + 1)
    expect(course.participants[course.participants.length - 1]).to eq(@jamppa)
  end

  def add_a_student
    fill_in('lastName', with: 'Jamppa')
    click_button 'Add to course'
  end

  def page_contains_participants
    expect(page).to have_content('Testi Jamppa')
  end

  def visit_map_page
    visit '/'
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
    @task4 = FactoryGirl.create :assignment, number: 4
    @task5 = FactoryGirl.create :assignment, number: 5

    @task1.location = FactoryGirl.create :location, x: 100, y: 200
    @task2.location = FactoryGirl.create :location, x: 360, y: 180
    @task3.location = FactoryGirl.create :location, x: 580, y: 190
    @task4.location = FactoryGirl.create :location, x: 630, y: 410
    @task5.location = FactoryGirl.create :location, x: 420, y: 390

    @course.assignments << @task1
    @course.assignments << @task2
    @course.assignments << @task3
    @course.assignments << @task4
    @course.assignments << @task5
  end