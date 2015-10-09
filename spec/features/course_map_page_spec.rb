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
          expect(page.find("button", :text => assignment.number))
        end
      end


      # button[:class] --> button undone-task ng-binding

      it "the positions of the buttons are determined by their location" do
        @course.assignments.each do |assignment|
          button = page.first("button", :text => assignment.number)
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

        describe "and when an assignment button is clicked" do

          describe "and the button was marked as undone before" do

            before :each do
              button = page.find('button', :text => '2')
              expect(button['class']).to have_content "undone-task"

              @doers_size = @task2.doers.length
              @students_tasks_size = StudentsTask.count

              button.click
            end

            it "it is marked as done" do
              button = page.find('button', :text => '2')

              expect(button['class']).to have_content "done-task"
              expect(button['class']).not_to have_content "undone-task"
            end
#            not a visible feature now
#            it "the amount of doers associated with that assignment is incremented by 1" do
#              check_that_amount_of_doers_of_assignment_matches_with_text(@task2, (@doers_size + 1).to_s)
#            end

            it "a new StudentsTask between @user2 and the assignment is created" do
              task2 = Assignment.find(@task2.id)

              expect(StudentsTask.count).to be(@students_tasks_size + 1)
              
              expect(task2.doers.length).to be(@doers_size + 1)
              expect(task2.doers.last).to eq(@user2)
            end
          end

          describe "and the button was marked as done before" do

            before :each do
              button = page.find('button', :text => '1')
              expect(button['class']).to have_content "done-task"

              @doers_size = @task1.doers.length
              @students_tasks_size = StudentsTask.count

              expect(@task1.doers.include?(@user2)).to be(true)

              button.click
            end

            it "it is marked as undone" do
              button = page.find('button', :text => '2')
              expect(button['class']).to have_content "undone-task"
            end
#             not a feature now
#            it "the amount of doers associated with that assignment is decremented by 1" do
#              check_that_amount_of_doers_of_assignment_matches_with_text(@task1, (@doers_size - 1).to_s)
#            end 

            it "the StudentsTask between @user2 and the assignment is deleted" do
              task1 = Assignment.find(@task1.id)

              expect(StudentsTask.count).to be(@students_tasks_size - 1)
              
              expect(task1.doers.length).to be(@doers_size - 1)
              expect(task1.doers.include?(@user2)).to be(false)
            end
          end
        end
      end

#      it "user can see, how many participants have completed each assignment" do
#          amounts_of_doers = page.all("label", :text => '1')
#
#          expect(amounts_of_doers.length).to be(4)  # tarkistaa, onko tiedostossa jossain <label ...>1</label>
#          enumerator = amounts_of_doers.each

#          for i in 1..4
#              elem = enumerator.next
#              style = elem[:style]

#              same_style_found = false

#              @course.assignments.each do |assignment|
#                  assignment_style = style_by_assignment(assignment)

#                  same_style_found = true if style === assignment_style
#              end
#              expect(same_style_found).to be(true)

#              i = i + 1
#          end

#          same_style_found = false

#          amounts_of_doers = page.all("label", :text => '2')
#          expect(amounts_of_doers.length).to be(1)

#          style = amounts_of_doers.each.next[:style]

#          @course.assignments.each do |assignment|
#              assignment_style = style_by_assignment(assignment)

#              same_style_found = true if style === assignment_style
#          end

#          expect(same_style_found).to be(true)
#      end


      describe "when user sets the mouse above one of the assignment buttons" do

        before :each do
          expect(page.find('button', :text => '1')[:class]).not_to have_content('dependent')
          expect(page.find('button', :text => '2')[:class]).not_to have_content('dependent')

          page.find('button', :text => '4').hover
        end

        it "the user can see the assignments this assignments depends on" do
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
  course2.assignments << (FactoryGirl.create :assignment)

  @user1 = FactoryGirl.create :user
  @user2 = FactoryGirl.create :user
  @user3 = FactoryGirl.create :user

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

def style_by_assignment(assignment)
  "top: " + (assignment.location.y + 5).to_s + "px; left: " + (assignment.location.x + 25).to_s + "px;"
end

def check_that_amount_of_doers_of_assignment_matches_with_text(assignment, text)
  enumerator = page.all("label", :text => text).each
  found = false

  for i in 1..5
    elem = enumerator.next

    found = true if elem[:style].include?("top: " + (assignment.location.y + 5).to_s + "px")
    break if found

    i = i + 1
  end

  expect(found).to be(true)
end
