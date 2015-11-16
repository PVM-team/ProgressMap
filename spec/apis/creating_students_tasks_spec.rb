require 'rails_helper'
require 'rack/test'

describe "Creating StudentsTasks", type: :api do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  before :each do
    course_details
    @tasks_in_db = StudentsTask.count
  end

  describe "when a HTTP post request to '/students' is done" do

    describe "and the given parameters are valid" do

      before :each do
        @count = @student1.assignments.length
      end

      describe "and student has not done assignment yet" do

        describe "and the complete value of created task is set to true" do

          before :each do
            create_students_task(@course.id, @assignment2.number, @student1.token, true)
          end

          describe "a new students_task is saved to database" do

            before :each do
              expect(StudentsTask.count).to be(@tasks_in_db + 1)
            end

            it "and the complete value of the task is 'true'" do
              expect(StudentsTask.last.complete).to be(true)
            end

            it "and the added students_task is put in the tasks of the student whose token matches that of given" do
              @student1 = (Course.find_by id: @course.id).students[0]

              expect(@student1.assignments.length).to be(@count + 1)
              expect(@student1.assignments[@count]).to eq(@assignment2)
            end

            it "and the HTTP response contains a valid code and message" do
              expect(@response["code"]).to be(201)
              expect(@response["message"]).to eq("created")
            end
          end
        end

        describe "and the complete value of created task is not defined" do

          before :each do
            create_students_task(@course.id, @assignment2.number, @student1.token)
          end

          describe "a new students_task is saved to database" do

            before :each do
              expect(StudentsTask.count).to be(@tasks_in_db + 1)
            end

            it "and the complete value of the task is 'false'" do
              expect(StudentsTask.last.complete).to be(false)
            end
          end
        end        
      end

      describe "and student has already done the assignment" do

        before :each do
          create_students_task(@course.id, @assignment1.number, @student1.token, true)
        end

        it "no new new students_task is saved to database" do
          expect(StudentsTask.count).to be(@tasks_in_db)
        end

        it "the students_tasks, of the student whose token matches that of given, doesn't change" do
          expect(@student1.assignments.length).to be(@count)
          expect(@student1.assignments[@count - 1]).to eq(@assignment1)          
        end
        
        it "and the HTTP response contains information behind what happened" do
          check_that_response_contains_the_following(412, "course_id: " + @course.id.to_s, "number: " + @assignment1.number.to_s)
        end
      end
    end

    describe "and student has attempted to do the assignment before and this time succeeds" do

      before :each do
        @count2 = @student2.assignments.length
        create_students_task(@course.id, @assignment2.number, @student2.token, true)
      end

      it "no new new students_task is saved to database" do
        expect(StudentsTask.count).to be(@tasks_in_db)
      end

      it "the students_tasks, of the student whose token matches that of given, doesn't change" do
        expect(@student2.assignments.length).to be(@count2)
        expect(@student2.assignments[@count2 - 1]).to eq(@assignment2)
      end

      it "and the HTTP response contains information behind what happened" do
        expect(@response["code"]).to be(200)
        expect(@response["message"]).to eq("task marked as done")
      end
    end

    describe "and student has attempted to do the assignment before and it fails again" do

      before :each do
        @count2 = @student2.assignments.length
        create_students_task(@course.id, @assignment2.number, @student2.token)
      end

      it "no new new students_task is saved to database" do
        expect(StudentsTask.count).to be(@tasks_in_db)
      end

      it "the students_tasks, of the student whose token matches that of given, doesn't change" do
        expect(@student2.assignments.length).to be(@count2)
        expect(@student2.assignments[@count2 - 1]).to eq(@assignment2)
      end

      it "and the HTTP response contains information behind what happened" do
        check_that_response_contains_the_following(412, "course_id: " + @course.id.to_s, "number: " + @assignment2.number.to_s)
      end
    end

    describe "and no course exists with provided course_id" do

      before :each do
        create_students_task(Course.count + 1, @assignment2.number, @student1.token, true)
      end

      it "no new new students_task is saved to database" do
        expect(StudentsTask.count).to be(@tasks_in_db)
      end

      it "HTTP response contains error information about invalid course_id" do
        check_that_response_contains_the_following(400, "Invalid", "course_id: " + (Course.count + 1).to_s)
      end
    end

    describe "and no assignment exists with given number on a valid course with provided course_id" do

      before :each do
        create_students_task(@course.id, @course.assignments.length + 1, @student1.token, true)
      end

      it "no new new students_task is saved to database" do
        expect(StudentsTask.count).to be(@tasks_in_db)
      end

      it "HTTP response contains error information about invalid number" do
        check_that_response_contains_the_following(400, "Invalid", "number: " + (@course.assignments.length + 1).to_s)
      end
    end

    describe "and no student has the provided student_token" do

      before :each do
        create_students_task(@course.id, @assignment2, "abc-123-def", true)
      end

      it "no new new students_task is saved to database" do
        expect(StudentsTask.count).to be(@tasks_in_db)
      end

      it "HTTP response contains error information about invalid student_token" do
        check_that_response_contains_the_following(400, "Invalid", "student_token: abc-123-def")
      end
    end
  end
end

def create_students_task(course_id, number, token, complete = nil)
  params = {:course_id => course_id, :number => number, :student_token => token, :complete => complete}

  response = post("/students_tasks", params)
  @response = JSON.parse(response.body)
end

def course_details
  FactoryGirl.create :course
  @course = FactoryGirl.create :course

  @student1 = FactoryGirl.create :student, :firstName => "Erkki", :lastName => "Mäkelä"
  @student2 = FactoryGirl.create :student, :firstName => "Erkki", :lastName => "Marttila"
  FactoryGirl.create :student, :firstName => "Erä", :lastName => "Jorma"

  @assignment1 = FactoryGirl.create :assignment, :name => "Eka", :number => 1
  @assignment2 = FactoryGirl.create :assignment, :name => "Toka", :number => 2
  @assignment3 = FactoryGirl.create :assignment, :name => "Kolmas", :number => 3
  @assignment4 = FactoryGirl.create :assignment, :name => "Neljäs", :number => 4

  @course.students << @student1
  @course.students << @student2

  @course.assignments << @assignment1
  @course.assignments << @assignment2
  @course.assignments << @assignment3
  @course.assignments << @assignment4

  @student1.assignments << @assignment1
  task = StudentsTask.first
  task.complete = true
  task.save
  @student2.assignments << @assignment2
end

def check_that_response_contains_the_following(code, msg_part1, msg_part2)
  expect(@response["code"]).to be(code)
  expect(@response["message"].include?(msg_part1)).to be(true)
  expect(@response["message"].include?(msg_part2)).to be(true)
end