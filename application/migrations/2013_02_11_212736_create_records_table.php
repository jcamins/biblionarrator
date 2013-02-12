<?php

class Create_Records_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
    public function up() {
        Schema::table('records', function($table) {
            $table->create();
            $table->increments('id');
            $table->foreign('record_type_id')->references('id')->on('record_type');
            $table->text('data');
            $table->timestamps();
        });
    }

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
    public function down() {
        Schema::drop('records');
    }

}
