class StudentsTasksController < ApplicationController

    def update # vaihda metodiksi 'create' kun poistetaan MapControllerista angularin puolelta ko. toiminnallisuus
        assignment = find_assignment(params[:course_id], params[:number].to_i)
        student = Student.find_by token: params[:student_token]
        attempt = params[:complete]

        task = StudentsTask.find_by_assignment_id_and_student_id(assignment, student)

        if assignment and student and task
            if task.complete
                render_json(412, "Student has already done the assignment defined by course_id: " + params[:course_id] + ", and number: " + params[:number])
            elsif !task.complete and attempt
                task.complete = true
                task.save
                render_json(200, "task marked as done")
            else
                render_json(412, "Student has already attempted the assignment defined by course_id: " + params[:course_id] + ", and number: " + params[:number])
            end

        elsif assignment and student and task.nil?
            student.assignments << assignment
            render_json(201, "created")

        elsif assignment.nil?
            course = Course.find_by id: params[:course_id]

            if course.nil?
                render_json(400, "Invalid parameter for course_id: " + params[:course_id])
                return
            end

            render_json(400, "Invalid parameter for number: " + params[:number])
        
        elsif student.nil?
            render_json(400, "Invalid parameter for student_token: " + params[:student_token])

        else
            render_json(600, "Unexpected behavior from valid input.\nTask wasn't marked for student to be complete.")
        end
    end


    def create
        task = StudentsTask.new(students_task_params)
        if params[:complete]
            task.complete = true
        end
        task.save

        @students_task = []
        @students_task << task

        render 'students_tasks/show.json.jbuilder'
    end

    def destroy
        task = StudentsTask.find_by_assignment_id_and_student_id(params[:assignment_id], params[:student_id])
        task.destroy if task

        render plain: "StudentsTask deleted"
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
            params.require(:students_task).permit(:assignment_id, :student_id)
        end
end