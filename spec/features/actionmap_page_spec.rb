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

  	describe "when actionmap page is opened" do

  		before :each do
  			course_details
            visit_map_page
  			visit_action_map_page
  		end

  		it "it has a canvas" do
  			canvas = page.find("canvas")
  			expect(canvas.visible?).to be(true)
      end

      it "it has a canvas the same width as the window" do
				canvas = page.find("canvas")
        window = page.driver.browser.manage.window
				expect(canvas['width']).equal?(window.size[0])
      end

      it "it changes canvas width when window width is changed" do
				canvas = page.find("canvas")
        window = page.driver.browser.manage.window
        window.resize_to(1000,1000)
        expect(canvas['width']).equal?(1000)
				window.resize_to(500,1000)
				expect(canvas['width']).equal?(500)
      end

	end
end

def visit_map_page
    visit '#/map/1'
end

def visit_action_map_page
 click_button 'Go to action map'
end

def course_details
	@course = FactoryGirl.create :course

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
end
