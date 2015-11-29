class TeachersController < ApplicationController

    def exists
        if Teacher.find_by email: params[:email]
            render plain: true
        else
            render plain: false
        end
    end

    def create
        @teacher = Teacher.new :email => params[:email], :name => params[:name]
        @teacher.save
        
        render json: @teacher
    end
end