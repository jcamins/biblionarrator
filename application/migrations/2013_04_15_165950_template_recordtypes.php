<?php

class Template_Recordtypes {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('templates', function($table) {
            $table->integer('recordtype_id')->unsigned()->nullable();
            $table->foreign('recordtype_id')->references('id')->on('recordtypes');
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table('templates', function($table) {
        });
	}

}
