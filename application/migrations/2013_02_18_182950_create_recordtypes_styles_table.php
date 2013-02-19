<?php

class Create_Recordtypes_Styles_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('recordtype_style', function($table) {
            $table->create();
            $table->increments('id');
            $table->integer('recordtype_id')->unsigned();
            $table->foreign('recordtype_id')->references('id')->on('recordtypes');
            $table->integer('style_id')->unsigned();
            $table->foreign('style_id')->references('id')->on('styles');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('recordtype_style');
	}

}
