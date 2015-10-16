require 'rails_helper'

describe "Student map page", js: true do

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

    describe "when map page is opened" do

      before :each do
        course_details
        visit_student_map_page
      end

      it "it has a canvas" do
        canvas = page.find("canvas")
        expect(canvas.visible?).to be(true)
      end

      it "it has one button for each assignment" do
        @course.assignments.each do |assignment|
          page.find("button", :text => assignment.number)
        end
      end

      it "the positions of the buttons are determined by their location" do
        @course.assignments.each do |assignment|
          button = page.find("button", :text => assignment.number)
          style = button[:style]

          expect(style).to have_content("top: " + (assignment.location.y - 25).to_s + "px")
          expect(style).to have_content("left: " + (assignment.location.x - 25).to_s + "px")
        end
      end

      it "the student can see the tasks (s)he has done as marked" do
        check_that_student_sees_done_tasks_as_done(3)
      end

      it "the student can see the tasks (s)he has not done marked as undone" do
        check_that_student_sees_undone_tasks_as_undone(2)
      end

      describe "when student sets the mouse above one of the assignment buttons" do

        before :each do
          expect(page.find('button', :text => '1')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '2')[:class]).not_to have_content('dependent')

          page.find('button', :text => '4').hover
        end

        it "the student can see the assignments this assignments depends on" do
          expect(page.find('button', :text => '1')[:class]).to have_content('dependent')
          expect(page.find('button', :text => '2')[:class]).to have_content('dependent')
          expect(page.find('button', :text => '3')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '4')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '5')[:class]).not_to have_content('dependent')
        end
      end

      describe "and 'Go to action map' button is clicked" do

        before :each do
          click_button 'Go to action map'
        end

        it "the action map is displayed" do
          page.find('.student-button')
        end

        describe "and when 'Go to normal map' button is clicked" do

          before :each do
            click_button 'Go to normal map'
          end

          it "the student is taken back to its normal map" do
            check_that_student_sees_undone_tasks_as_undone(2)
          end
        end
      end
    end
end

def course_details
  @student = FactoryGirl.create :student
  @course = FactoryGirl.create :course

  @task1 = FactoryGirl.create :assignment, number: 1
  @task2 = FactoryGirl.create :assignment, number: 2
  @task3 = FactoryGirl.create :assignment, number: 3
  @task4 = FactoryGirl.create :assignment, number: 4
  @task5 = FactoryGirl.create :assignment, number: 5

  @task2.dependencies << @task1
  @task3.dependencies << @task1
  @task4.dependencies << @task1
  @task4.dependencies << @task2
  @task5.dependencies << @task2
  @task5.dependencies << @task4

  @task1.location = FactoryGirl.create :location, x: 100, y: 200
  @task2.location = FactoryGirl.create :location, x: 360, y: 180
  @task3.location = FactoryGirl.create :location, x: 580, y: 190
  @task4.location = FactoryGirl.create :location, x: 630, y: 410
  @task5.location = FactoryGirl.create :location, x: 420, y: 390

  @course.students << @student

  @course.assignments << @task1
  @course.assignments << @task2
  @course.assignments << @task3
  @course.assignments << @task4
  @course.assignments << @task5

  @student.assignments << @task1
  @student.assignments << @task3
  @student.assignments << @task4
end

def visit_student_map_page
  visit '/#/student/' + @student.token
end

def check_that_student_sees_tasks_with_status_as_status(assignments, status, amount)
  index = 0

    assignments.each do |assignment|

      @course.assignments.each do |course_assignment|
        if course_assignment === assignment

          button = page.find("button", :text => assignment.number)
          clas = button[:class]

          expect(clas).to have_content(status)
          index = index + 1
        end
      end
    end
    expect(index).to be(amount)
end

def check_that_student_sees_done_tasks_as_done(amount)
    check_that_student_sees_tasks_with_status_as_status(@student.assignments, "done-task", amount)
end

def check_that_student_sees_undone_tasks_as_undone(amount)
  undone_tasks = []

  @course.assignments.each do |assignment|
    undone_tasks << assignment unless student_has_done_assignment(assignment)
  end

  check_that_student_sees_tasks_with_status_as_status(undone_tasks, "undone-task", amount)
end

def student_has_done_assignment(assignment)
  @student.assignments.each do |a|

    return true if a === assignment
  end
  false
end

def style_by_assignment(assignment)
  "top: " + (assignment.location.y + 5).to_s + "px; left: " + (assignment.location.x + 25).to_s + "px;"
end