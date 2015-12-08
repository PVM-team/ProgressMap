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

    describe "when map page is opened" do

      before :each do
        course_details
        visit_map_page
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
          expect(style).to have_content("left: " + (assignment.location.x - 5).to_s + "px")
        end
      end

      describe "when current student is @student2" do

        it "student can see 4 assignments marked as done" do
          check_that_student_sees_done_tasks_as_done(@course, @student2, 4)
        end

        it "one of the assignments is marked as undone" do
          check_that_student_sees_undone_tasks_as_undone(@course, @student2, 1)
        end

        describe "and when an assignment button is clicked" do

          describe "and the button was marked as undone before" do

            before :each do
              button = page.find('button', :text => '3')
              expect(button['class']).to have_content "undone-task"

              @doers_size = @assignment3.doers.length
              @students_tasks_size = StudentsTask.count

              button.click
            end

            xit "it is marked as done" do
              button = page.find('button', :text => '3')

              expect(button['class']).to have_content "done-task"
              expect(button['class']).not_to have_content "undone-task"
            end

            xit "the StudentsTask between @student2 and the assignment is updated" do
              expect(StudentsTask.count).to be(@students_tasks_size)

              assignment3 = Assignment.find(@assignment3.id)

              expect(assignment3.doers.length).to be(@doers_size + 1)
              expect(assignment3.doers.last).to eq(@student2)
            end
          end

          describe "and the button was marked as done before" do

            before :each do
              button = page.find('button', :text => '1')
              expect(button['class']).to have_content "done-task"
              expect(button['class']).not_to have_content "undone-task"

              @doers_size = @assignment1.doers.length
              @students_tasks_size = StudentsTask.count

              expect(@assignment1.doers.include?(@student2)).to be(true)

              button.click
            end

            it "it is marked as undone" do
              button = page.find('button', :text => '2')
              expect(button['class']).to have_content "undone-task"
            end

            it "the StudentsTask between @student2 and the assignment is not deleted" do
              expect(@assignment1.doers.length).to be(@doers_size)
              expect(@assignment1.doers.include?(@student2)).to be(true)
            end
          end
        end
      end

      describe "when student sets the mouse above one of the assignment buttons" do

        before :each do
          expect(page.find('button', :text => '1')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '2')[:class]).not_to have_content('dependent')

          page.find('button', :text => '4').hover
        end

        xit "the student can see the assignments this assignments depends on" do
          expect(page.find('button', :text => '1')[:class]).to have_content('dependent')
          expect(page.find('button', :text => '2')[:class]).to have_content('dependent')
          expect(page.find('button', :text => '3')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '4')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '5')[:class]).not_to have_content('dependent')
        end
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

  @assignment1 = FactoryGirl.create :assignment, name: "tehtävä1", number: 1
  @assignment2 = FactoryGirl.create :assignment, name: "tehtävä2", number: 2
  @assignment3 = FactoryGirl.create :assignment, name: "tehtävä3", number: 3
  @assignment4 = FactoryGirl.create :assignment, name: "tehtävä4", number: 4
  @assignment5 = FactoryGirl.create :assignment, name: "tehtävä5", number: 5

  @assignment2.dependencies << @assignment1
  @assignment3.dependencies << @assignment1
  @assignment4.dependencies << @assignment1
  @assignment4.dependencies << @assignment2
  @assignment5.dependencies << @assignment2
  @assignment5.dependencies << @assignment4

  @assignment1.location = FactoryGirl.create :location, x: 100, y: 200
  @assignment2.location = FactoryGirl.create :location, x: 360, y: 180
  @assignment3.location = FactoryGirl.create :location, x: 580, y: 190
  @assignment4.location = FactoryGirl.create :location, x: 630, y: 410
  @assignment5.location = FactoryGirl.create :location, x: 420, y: 390

  @course.students << @student1
  @course.students << @student2
  @course.students << @student3

  @course.assignments << @assignment1
  @course.assignments << @assignment2
  @course.assignments << @assignment3
  @course.assignments << @assignment4
  @course.assignments << @assignment5

  StudentsTask.create assignment_id: @assignment1.id, student_id: @student1.id, complete: true
  StudentsTask.create assignment_id: @assignment2.id, student_id: @student1.id, complete: true

  StudentsTask.create assignment_id: @assignment1.id, student_id: @student2.id, complete: true
  StudentsTask.create assignment_id: @assignment3.id, student_id: @student2.id, complete: false
  StudentsTask.create assignment_id: @assignment4.id, student_id: @student2.id, complete: true
  StudentsTask.create assignment_id: @assignment5.id, student_id: @student2.id, complete: true

  StudentsTask.create assignment_id: course2.assignments[0].id, student_id: @student3.id, complete: true
end

def visit_map_page
    visit '#/map/1'
end

def check_that_student_sees_tasks_with_status_as_status(course, assignments, status, amount)
    index = 0

    assignments.each do |assignment|

        course.assignments.each do |course_assignment|
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

def style_by_assignment(assignment)
    "top: " + (assignment.location.y + 5).to_s + "px; left: " + (assignment.location.x + 25).to_s + "px;"
end