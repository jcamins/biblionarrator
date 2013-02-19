<?php

class Create_RecordTypes_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('recordtypes', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('name');
            $table->string('description');
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
        Schema::drop('recordtypes');
	}

}
