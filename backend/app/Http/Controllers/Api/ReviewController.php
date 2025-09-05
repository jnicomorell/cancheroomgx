<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Models\Field;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Field $field)
    {
        return $field->reviews()->paginate();
    }

    public function store(ReviewRequest $request, Field $field)
    {
        $review = $field->reviews()->create([
            'user_id' => $request->user()->id,
            'rating' => $request->input('rating'),
            'comment' => $request->input('comment'),
        ]);

        return response()->json($review, 201);
    }

    public function show(Field $field, Review $review)
    {
        abort_if($review->field_id !== $field->id, 404);

        return $review;
    }

    public function update(ReviewRequest $request, Field $field, Review $review)
    {
        abort_if($review->field_id !== $field->id, 404);

        if ($request->user()->id !== $review->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $review->update($request->validated());

        return response()->json($review);
    }

    public function destroy(Request $request, Field $field, Review $review)
    {
        abort_if($review->field_id !== $field->id, 404);

        if ($request->user()->id !== $review->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $review->delete();

        return response()->noContent();
    }
}
