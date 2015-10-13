class StudentsTasksController < ApplicationController

    def create
        task = StudentsTask.new(students_task_params)
        task.save

        @students_task = []
        @students_task << task

        render 'students_tasks/show.json.jbuilder'
    end

    def student_finished_task
        task = StudentsTask.new(students_task_params)

        if  task.save
            render plain: "Task added"
        else
            render plain: "Adding failed" 
        end

    end

    def destroy
        task = StudentsTask.find_by_assignment_id_and_user_id(params[:assignment_id], params[:user_id])
        task.destroy if task

        render plain: "StudentsTask deleted"
    end

    private

    def students_task_params
        params.require(:students_task).permit(:assignment_id, :user_id)
    end
end
