<?php

class Create_Collections_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('collections', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('name');
            $table->string('security');
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
        Schema::drop('collections');
	}

}
