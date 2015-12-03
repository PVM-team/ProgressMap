class TeachersController < ApplicationController

    def show
        teacher = Teacher.find_by email: params[:email]
        @teacher = []

        @teacher << teacher if teacher
        render 'teachers/show.json.jbuilder'
    end

    def create
        teacher = Teacher.new :email => params[:email], :name => params[:name]
        teacher.save
        @teacher = []

        @teacher << teacher
        render 'teachers/show.json.jbuilder'
    end
end
