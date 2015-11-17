class StudentsTasksController < ApplicationController

    def create
        params = JSON.parse(request.body.read.to_s)

        assignment = find_assignment(params["course_id"], params["number"])
        student = Student.find_by token: params["student_token"]

        complete = params["complete"] === true ? true : false

        task = StudentsTask.find_by_assignment_id_and_student_id(assignment, student)

        if task
            if task.complete
                render_json(412, "Student has already done the assignment defined by course_id: " + params["course_id"].to_s + ", and number: " + params["number"].to_s)
            
            elsif !task.complete and complete
                task.complete = true
                task.save
                render_json(200, "task marked as done")

            else
                render_json(412, "Student has already attempted the assignment defined by course_id: " + params["course_id"].to_s + ", and number: " + params["number"].to_s)
            end

        elsif assignment and student
            task = StudentsTask.create assignment_id: assignment.id, student_id: student.id, complete: complete
            render_json(201, "created")

        elsif assignment.nil?
            course = Course.find_by id: params["course_id"]

            if course.nil?
                render_json(400, "Invalid parameter for course_id: " + params["course_id"].to_s)
                return
            end

            render_json(400, "Invalid parameter for number: " + params["number"].to_s)
        
        elsif student.nil?
            render_json(400, "Invalid parameter for student_token: " + params["student_token"])

        else
            render_json(600, "Unexpected behavior from valid input.\nTask wasn't marked for student to be complete.")
        end
    end


    def update
        assignment = Assignment.find_by id: params[:assignment_id]
        student = Student.find_by id: params[:student_id]

        task = StudentsTask.find_by_assignment_id_and_student_id(assignment, student)
        task = StudentsTask.new(students_task_params) if not task

        task.complete = params[:complete]
        task.save

        @students_task = []
        @students_task << task

        render 'students_tasks/show.json.jbuilder'
    end


    private

        def render_json(code, message)
            params = {:code => code, :message => message}
            render json: params.to_json
        end

        def find_assignment(course_id, number)
            begin
                assignments = (Course.find_by id: course_id).assignments
                assignments[number - 1]
            rescue NoMethodError => e # Course.find_by id: course_id = 'nil'
                nil
            end
        end

        def students_task_params
            params.require(:students_task).permit(:assignment_id, :student_id, :complete)
        end
end