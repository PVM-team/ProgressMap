require 'rails_helper'

context "As a teacher I want to create a course", js: true do

  before :all do
    self.use_transactional_fixtures = false
  end

  after :all do
  	self.use_transactional_fixtures = true
  end  	

	before :each do
  	DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.start

		FactoryGirl.create :course
	 end

  after :each do
    DatabaseCleaner.clean
  end

	Steps "Creating a course" do

		Given "I visit the course creation page" do
			visit_course_creation_page
		end

		Then "Submit button is disabled" do
			submit_button_is_disabled
		end		

		When "I fill course name with 'Ohtuprojekti' and assignments with '3'" do
			fill_course_name_and_assignment_count_with('Ohtuprojekti', '3')
		end

		Then "Submit button is enabled" do
			submit_button_is_enabled
		end
	end
end

def visit_course_creation_page
 visit '/'
 click_button 'Create a new course'
end

def submit_button_is_disabled
  button = page.find('button', :text => 'Submit')

  expect(button.visible?).to be(true)
  expect(button[:disabled]).to eq("true")
end

def submit_button_is_enabled
  button = find_button('Submit')

  expect(button[:disabled]).to be(nil)
end

def fill_course_name_and_assignment_count_with(course_name, assignment_count)
  fill_in('courseName', with: course_name)
  fill_in('assignmentCount', with: assignment_count)
end